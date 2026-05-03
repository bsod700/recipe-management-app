import {
  recipeImageAutofillResponseSchema,
  recipeImageOcrResponseSchema,
  type RecipeImageAutofillResponse,
  type RecipeImageOcrResponse,
} from '@domain/schemas/recipeImageAutofillSchema';
import { ZodError } from 'zod';

export interface RecipeScanImagePayload {
  readonly base64Data: string;
  readonly mimeType: 'image/jpeg' | 'image/png';
}

interface OcrExtractRequest {
  readonly mode: 'ocr_extract';
  readonly language: 'he';
  readonly images: ReadonlyArray<RecipeScanImagePayload>;
}

interface RecipeMergeRequest {
  readonly mode: 'recipe_merge';
  readonly language: 'he';
  readonly contextText: string;
}

type RecipeAiRequest = OcrExtractRequest | RecipeMergeRequest;

const BASE_REQUEST_TIMEOUT_MS = 10_000;
const MAX_REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRY_COUNT = 2;
const MULTI_IMAGE_DELAY_MS = 1_800;

interface RequestStrategy {
  readonly maxRetryCount?: number;
  readonly baseTimeoutMs?: number;
}

export type RecipeScanErrorKind =
  | 'endpoint_missing'
  | 'timeout'
  | 'proxy_http'
  | 'proxy_invalid_json'
  | 'validation_failed'
  | 'network'
  | 'unknown';

export class RecipeScanError extends Error {
  readonly kind: RecipeScanErrorKind;
  readonly status?: number;
  readonly requestId?: string;
  readonly errorCode?: string;
  readonly provider?: string;
  readonly stage?: 'ocr' | 'merge';

  constructor(
    kind: RecipeScanErrorKind,
    message: string,
    options?: {
      status?: number;
      requestId?: string;
      errorCode?: string;
      provider?: string;
      stage?: 'ocr' | 'merge';
    }
  ) {
    super(message);
    this.name = 'RecipeScanError';
    this.kind = kind;
    this.status = options?.status;
    this.requestId = options?.requestId;
    this.errorCode = options?.errorCode;
    this.provider = options?.provider;
    this.stage = options?.stage;
  }
}

function getAutofillEndpoint(): string {
  const endpoint = process.env.EXPO_PUBLIC_RECIPE_AI_PROXY_URL;
  if (!endpoint) {
    throw new RecipeScanError(
      'endpoint_missing',
      'Missing EXPO_PUBLIC_RECIPE_AI_PROXY_URL'
    );
  }
  return endpoint;
}

function randomRequestId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toRecipeScanError(error: unknown): RecipeScanError {
  if (error instanceof RecipeScanError) return error;
  if (error instanceof ZodError) {
    return new RecipeScanError('validation_failed', error.message);
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return new RecipeScanError('timeout', error.message);
  }
  if (error instanceof Error && error.message.includes('Network request failed')) {
    return new RecipeScanError('network', error.message);
  }
  if (error instanceof Error) {
    return new RecipeScanError('unknown', error.message);
  }
  return new RecipeScanError('unknown', 'Recipe extraction failed');
}

async function requestAutofill(
  endpoint: string,
  payload: RecipeAiRequest,
  requestId: string,
  timeoutMs: number
): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    console.warn(
      `[recipe-scan] request:start id=${requestId} mode=${payload.mode} timeoutMs=${timeoutMs}`
    );
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': requestId,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new RecipeScanError(
          'proxy_http',
          `Autofill request failed (${response.status})`,
          { status: response.status }
        );
      }
      const payloadBody = body as {
        errorCode?: string;
        message?: string;
        requestId?: string;
        provider?: string;
        stage?: 'ocr' | 'merge';
      };
      throw new RecipeScanError(
        'proxy_http',
        payloadBody.message ?? `Autofill request failed (${response.status})`,
        {
          status: response.status,
          requestId: payloadBody.requestId ?? requestId,
          errorCode: payloadBody.errorCode,
          provider: payloadBody.provider,
          stage: payloadBody.stage,
        }
      );
    }
    try {
      const json = await response.json();
      console.warn(`[recipe-scan] request:success id=${requestId}`);
      return json;
    } catch {
      throw new RecipeScanError('proxy_invalid_json', 'Proxy returned invalid JSON', {
        requestId,
      });
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function extractTextFromImages(
  images: ReadonlyArray<RecipeScanImagePayload>,
  strategy?: RequestStrategy
): Promise<RecipeImageOcrResponse> {
  if (images.length === 0) {
    throw new RecipeScanError('unknown', 'No images provided for recipe extraction');
  }

  if (images.length > 1) {
    const collectedTexts: string[] = [];
    const collectedWarnings: string[] = [];
    let lastFailure: RecipeScanError | undefined;
    let consecutiveUpstreamFailures = 0;

    for (let index = 0; index < images.length; index += 1) {
      try {
        const singleResult = await extractTextFromImages([images[index]], {
          maxRetryCount: 0,
          baseTimeoutMs: 14_000,
        });
        collectedTexts.push(...singleResult.texts);
        if (singleResult.warnings) {
          collectedWarnings.push(...singleResult.warnings);
        }
        consecutiveUpstreamFailures = 0;
      } catch (error) {
        const normalized = toRecipeScanError(error);
        lastFailure = normalized;
        if (
          normalized.kind === 'proxy_http' &&
          normalized.errorCode === 'model_upstream_failed'
        ) {
          consecutiveUpstreamFailures += 1;
        } else {
          consecutiveUpstreamFailures = 0;
        }

        // Stop early when upstream is clearly overloaded; avoids noisy repeated failures.
        if (consecutiveUpstreamFailures >= 2 && collectedTexts.length === 0) {
          throw normalized;
        }
      }
      // Reduce upstream burst pressure when processing many images.
      if (index < images.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, MULTI_IMAGE_DELAY_MS));
      }
    }

    if (collectedTexts.length === 0) {
      throw lastFailure ?? new RecipeScanError('unknown', 'OCR extraction failed for all images');
    }

    if (lastFailure) {
      collectedWarnings.push('Some images could not be processed and were skipped.');
      console.warn(
        `[recipe-scan] ocr:partial-success processedTexts=${collectedTexts.length} warnings=${collectedWarnings.length}`
      );
    }

    return collectedWarnings.length > 0
      ? { texts: collectedTexts, warnings: collectedWarnings }
      : { texts: collectedTexts };
  }

  const endpoint = getAutofillEndpoint();
  const requestId = randomRequestId();
  const payload: OcrExtractRequest = {
    mode: 'ocr_extract',
    language: 'he',
    images,
  };
  const maxRetryCount = strategy?.maxRetryCount ?? MAX_RETRY_COUNT;
  const baseTimeoutMs = strategy?.baseTimeoutMs ?? BASE_REQUEST_TIMEOUT_MS;
  const timeoutMs = Math.min(
    MAX_REQUEST_TIMEOUT_MS,
    baseTimeoutMs + (payload.images.length - 1) * 6_000
  );

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetryCount; attempt += 1) {
    try {
      console.warn(`[recipe-scan] parse:start id=${requestId} mode=ocr_extract attempt=${attempt + 1}`);
      const raw = await requestAutofill(endpoint, payload, requestId, timeoutMs);
      const parsed = recipeImageOcrResponseSchema.parse(raw);
      console.warn(`[recipe-scan] parse:success id=${requestId} mode=ocr_extract`);
      return parsed;
    } catch (error) {
      const normalized = toRecipeScanError(error);
      if (normalized.kind === 'unknown' && normalized.message.includes('Invalid')) {
        lastError = new RecipeScanError('validation_failed', normalized.message, {
          requestId,
        });
      } else if (!normalized.requestId) {
        lastError = new RecipeScanError(normalized.kind, normalized.message, {
          status: normalized.status,
          requestId,
          errorCode: normalized.errorCode,
          provider: normalized.provider,
          stage: normalized.stage,
        });
      } else {
        lastError = normalized;
      }
      const providerTag = (lastError as RecipeScanError).provider ?? 'unknown';
      const stageTag = (lastError as RecipeScanError).stage ?? 'ocr';
      console.error(
        attempt < maxRetryCount
          ? `[recipe-scan] request:retry id=${requestId} stage=${stageTag} provider=${providerTag} attempt=${attempt + 1} kind=${(lastError as RecipeScanError).kind} message=${(lastError as RecipeScanError).message}`
          : `[recipe-scan] request:failure id=${requestId} stage=${stageTag} provider=${providerTag} attempt=${attempt + 1} kind=${(lastError as RecipeScanError).kind} message=${(lastError as RecipeScanError).message}`
      );
      if (lastError instanceof RecipeScanError) {
        const shouldBackoff =
          (lastError.kind === 'proxy_http' &&
            ((lastError.status ?? 0) >= 500 ||
              lastError.errorCode === 'model_upstream_failed')) ||
          lastError.kind === 'timeout' ||
          lastError.kind === 'network';
        if (shouldBackoff) {
          const backoffMs =
            lastError.kind === 'proxy_http' && lastError.errorCode === 'model_upstream_failed'
              ? 1_200 * (attempt + 1)
              : 500 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
      if (attempt === maxRetryCount) break;
    }
  }

  throw lastError instanceof RecipeScanError
    ? lastError
    : new RecipeScanError('unknown', 'Recipe extraction failed', { requestId });
}

export async function mergeRecipeFromContext(
  contextText: string,
  strategy?: RequestStrategy
): Promise<RecipeImageAutofillResponse> {
  const normalizedContext = contextText.trim();
  if (normalizedContext.length === 0) {
    throw new RecipeScanError('unknown', 'No context text provided for recipe merge');
  }

  const endpoint = getAutofillEndpoint();
  const requestId = randomRequestId();
  const payload: RecipeMergeRequest = {
    mode: 'recipe_merge',
    language: 'he',
    contextText: normalizedContext,
  };
  const maxRetryCount = strategy?.maxRetryCount ?? 1;
  const baseTimeoutMs = strategy?.baseTimeoutMs ?? BASE_REQUEST_TIMEOUT_MS;
  const timeoutMs = Math.min(
    MAX_REQUEST_TIMEOUT_MS,
    baseTimeoutMs + 10_000
  );

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetryCount; attempt += 1) {
    try {
      console.warn(`[recipe-scan] parse:start id=${requestId} mode=recipe_merge attempt=${attempt + 1}`);
      const raw = await requestAutofill(endpoint, payload, requestId, timeoutMs);
      const parsed = recipeImageAutofillResponseSchema.parse(raw);
      console.warn(`[recipe-scan] parse:success id=${requestId} mode=recipe_merge`);
      return parsed;
    } catch (error) {
      const normalized = toRecipeScanError(error);
      if (normalized.kind === 'unknown' && normalized.message.includes('Invalid')) {
        lastError = new RecipeScanError('validation_failed', normalized.message, {
          requestId,
        });
      } else if (!normalized.requestId) {
        lastError = new RecipeScanError(normalized.kind, normalized.message, {
          status: normalized.status,
          requestId,
          errorCode: normalized.errorCode,
          provider: normalized.provider,
          stage: normalized.stage,
        });
      } else {
        lastError = normalized;
      }
      const providerTag = (lastError as RecipeScanError).provider ?? 'unknown';
      const stageTag = (lastError as RecipeScanError).stage ?? 'merge';
      console.error(
        attempt < maxRetryCount
          ? `[recipe-scan] request:retry id=${requestId} stage=${stageTag} provider=${providerTag} attempt=${attempt + 1} kind=${(lastError as RecipeScanError).kind} message=${(lastError as RecipeScanError).message}`
          : `[recipe-scan] request:failure id=${requestId} stage=${stageTag} provider=${providerTag} attempt=${attempt + 1} kind=${(lastError as RecipeScanError).kind} message=${(lastError as RecipeScanError).message}`
      );
      if (lastError instanceof RecipeScanError) {
        const shouldBackoff =
          (lastError.kind === 'proxy_http' &&
            ((lastError.status ?? 0) >= 500 ||
              lastError.errorCode === 'model_upstream_failed')) ||
          lastError.kind === 'timeout' ||
          lastError.kind === 'network';
        if (shouldBackoff) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
      if (attempt === maxRetryCount) break;
    }
  }

  throw lastError instanceof RecipeScanError
    ? lastError
    : new RecipeScanError('unknown', 'Recipe merge failed', { requestId });
}
