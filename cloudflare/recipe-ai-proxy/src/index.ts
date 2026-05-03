interface Env {
  OPENROUTER_API_KEY?: string;
  GROQ_API_KEY?: string;
  OPENROUTER_OCR_MODEL?: string;
  OPENROUTER_MERGE_MODEL?: string;
  GROQ_MERGE_MODEL?: string;
}

interface ScanImagePayload {
  readonly base64Data: string;
  readonly mimeType: 'image/jpeg' | 'image/png';
}

interface RecipeExtractRequest {
  readonly mode: 'ocr_extract';
  readonly language: 'he';
  readonly images: ReadonlyArray<ScanImagePayload>;
}

interface RecipeMergeRequest {
  readonly mode: 'recipe_merge';
  readonly language: 'he';
  readonly contextText: string;
}

type RecipeAiRequest = RecipeExtractRequest | RecipeMergeRequest;

const MAX_IMAGES = 5;
const OCR_TIMEOUT_MS = 20_000;
const MERGE_TIMEOUT_MS = 24_000;
const PROVIDER_COOLDOWN_MS = 20_000;

type ProviderName = 'openrouter' | 'groq';
type StageName = 'ocr' | 'merge';

interface ProviderFailure {
  readonly provider: ProviderName;
  readonly stage: StageName;
  readonly message: string;
}

class UpstreamStageError extends Error {
  readonly provider: ProviderName;
  readonly stage: StageName;

  constructor(provider: ProviderName, stage: StageName, message: string) {
    super(message);
    this.provider = provider;
    this.stage = stage;
  }
}

const providerCooldownUntil = new Map<string, number>();

function providerKey(provider: ProviderName, stage: StageName): string {
  return `${provider}:${stage}`;
}

function isProviderInCooldown(provider: ProviderName, stage: StageName): boolean {
  const until = providerCooldownUntil.get(providerKey(provider, stage)) ?? 0;
  return until > Date.now();
}

function markProviderCooldown(provider: ProviderName, stage: StageName): void {
  providerCooldownUntil.set(providerKey(provider, stage), Date.now() + PROVIDER_COOLDOWN_MS);
}

function corsHeaders(): HeadersInit {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-type': 'application/json',
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders() });
}

function errorResponse(
  requestId: string,
  errorCode: string,
  message: string,
  status: number,
  details?: { provider?: ProviderName; stage?: StageName }
): Response {
  return jsonResponse(
    {
      errorCode,
      message,
      requestId,
      ...(details?.provider ? { provider: details.provider } : {}),
      ...(details?.stage ? { stage: details.stage } : {}),
    },
    status
  );
}

function parseRequestBody(input: unknown): RecipeAiRequest {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Invalid request payload');
  }
  const body = input as Partial<RecipeAiRequest>;
  if (body.mode !== 'ocr_extract' && body.mode !== 'recipe_merge') {
    throw new Error('Unsupported mode');
  }
  if (body.language !== 'he') {
    throw new Error('Unsupported language');
  }
  if (body.mode === 'ocr_extract') {
    if (!Array.isArray(body.images) || body.images.length === 0) {
      throw new Error('At least one image is required');
    }
    if (body.images.length > MAX_IMAGES) {
      throw new Error('Too many images');
    }
    for (const image of body.images) {
      if (!image || typeof image.base64Data !== 'string' || image.base64Data.length === 0) {
        throw new Error('Invalid image data');
      }
      if (image.mimeType !== 'image/jpeg' && image.mimeType !== 'image/png') {
        throw new Error('Unsupported image type');
      }
    }
    return body as RecipeExtractRequest;
  }
  const mergeBody = body as Partial<RecipeMergeRequest>;
  if (typeof mergeBody.contextText !== 'string' || mergeBody.contextText.trim().length === 0) {
    throw new Error('Context text is required');
  }
  return {
    mode: 'recipe_merge',
    language: body.language,
    contextText: mergeBody.contextText.trim(),
  };
}

function buildOcrPrompt(): string {
  return [
    'Read the images and extract recipe-relevant text only.',
    'Return only strict JSON with the following shape:',
    '{',
    '  "texts": ["string"],',
    '  "warnings": ["string"]',
    '}',
    'Rules:',
    '- Keep text in Hebrew.',
    '- Split into logical chunks; each text entry should be meaningful.',
    '- Do not summarize beyond the text in the images.',
  ].join('\n');
}

function buildMergePrompt(contextText: string): string {
  return [
    'Merge this OCR text context into one recipe draft.',
    'Return only strict JSON with the following shape:',
    '{',
    '  "recipe": {',
    '    "title": "string or null (optional)",',
    '    "prepTimeMinutes": "number or null (optional)",',
    '    "cookTimeMinutes": "number or null (optional)",',
    '    "servings": "number or null (optional)",',
    '    "ingredients": [',
    '      {',
    '        "name": "string",',
    '        "amount": "number or null",',
    '        "unit": "string or null"',
    '      }',
    '    ],',
    '    "instructions": ["string"],',
    '    "warnings": ["string"]',
    '  }',
    '}',
    'Rules:',
    '- Language in output must be Hebrew.',
    '- Never invent precise numbers when missing. Use null and add warning.',
    '- Keep ingredient units as text literals (do not normalize to enum).',
    '- Keep instructions concise and actionable.',
    '',
    'Context text to merge:',
    contextText,
  ].join('\n');
}

function extractProviderText(body: unknown): string {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Unexpected provider response');
  }
  const value = body as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };
  const content = value.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const joined = content
      .filter((item) => item.type === 'text' && typeof item.text === 'string')
      .map((item) => item.text as string)
      .join('\n');
    if (joined.trim().length > 0) return joined;
  }
  throw new Error('Empty provider response');
}

async function callOpenRouter(
  env: Env,
  payload: RecipeAiRequest,
  requestId: string
): Promise<unknown> {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter key missing');
  }
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  const model = payload.mode === 'ocr_extract'
    ? env.OPENROUTER_OCR_MODEL ?? 'openrouter/free'
    : env.OPENROUTER_MERGE_MODEL ?? 'openrouter/free';
  const timeoutMs = payload.mode === 'ocr_extract' ? OCR_TIMEOUT_MS : MERGE_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const userContent = payload.mode === 'ocr_extract'
    ? [
        { type: 'text', text: buildOcrPrompt() },
        ...payload.images.map((image) => ({
          type: 'image_url',
          image_url: {
            url: `data:${image.mimeType};base64,${image.base64Data}`,
          },
        })),
      ]
    : [{ type: 'text', text: buildMergePrompt(payload.contextText) }];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'content-type': 'application/json',
        'x-title': 'recipe-management-app',
        'x-request-id': requestId,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: userContent }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) {
      throw new Error(`OpenRouter upstream failed (${response.status})`);
    }
    return JSON.parse(extractProviderText(await response.json()));
  } finally {
    clearTimeout(timeout);
  }
}

async function callGroqMerge(
  env: Env,
  payload: RecipeMergeRequest,
  requestId: string
): Promise<unknown> {
  if (!env.GROQ_API_KEY) {
    throw new Error('Groq key missing');
  }
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const model = env.GROQ_MERGE_MODEL ?? 'llama-3.1-8b-instant';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MERGE_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.GROQ_API_KEY}`,
        'content-type': 'application/json',
        'x-request-id': requestId,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: buildMergePrompt(payload.contextText) }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) {
      throw new Error(`Groq upstream failed (${response.status})`);
    }
    return JSON.parse(extractProviderText(await response.json()));
  } finally {
    clearTimeout(timeout);
  }
}

async function runStageWithFallback(
  env: Env,
  payload: RecipeAiRequest,
  requestId: string
): Promise<{ output: unknown; provider: ProviderName; stage: StageName }> {
  const stage: StageName = payload.mode === 'ocr_extract' ? 'ocr' : 'merge';
  const failures: ProviderFailure[] = [];
  const providers: ProviderName[] =
    stage === 'ocr'
      ? ['openrouter']
      : env.GROQ_API_KEY
        ? ['openrouter', 'groq']
        : ['openrouter'];

  for (const provider of providers) {
    if (isProviderInCooldown(provider, stage)) {
      console.warn(`[recipe-ai-proxy] id=${requestId} stage=${stage} provider=${provider} status=skip_cooldown`);
      failures.push({ provider, stage, message: 'provider in cooldown' });
      continue;
    }
    try {
      const output = provider === 'openrouter'
        ? await callOpenRouter(env, payload, requestId)
        : await callGroqMerge(env, payload as RecipeMergeRequest, requestId);
      console.warn(`[recipe-ai-proxy] id=${requestId} stage=${stage} provider=${provider} status=success`);
      return { output, provider, stage };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      markProviderCooldown(provider, stage);
      console.error(`[recipe-ai-proxy] id=${requestId} stage=${stage} provider=${provider} status=failed message=${message}`);
      failures.push({ provider, stage, message });
    }
  }

  const lastFailure = failures[failures.length - 1];
  throw new UpstreamStageError(
    lastFailure?.provider ?? 'openrouter',
    stage,
    lastFailure?.message ?? 'providers exhausted'
  );
}

function normalizeMergeOutput(input: unknown): { recipe: Record<string, unknown> } {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Unexpected model output');
  }
  const value = input as { recipe?: unknown };
  if (typeof value.recipe !== 'object' || value.recipe === null) {
    throw new Error('Missing recipe object in model output');
  }
  return { recipe: value.recipe as Record<string, unknown> };
}

function normalizeOcrOutput(input: unknown): { texts: string[]; warnings?: string[] } {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Unexpected OCR output');
  }
  const value = input as { texts?: unknown; warnings?: unknown };
  if (!Array.isArray(value.texts)) {
    throw new Error('Missing OCR texts');
  }
  const texts = value.texts.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (texts.length === 0) {
    throw new Error('Empty OCR texts');
  }
  const warnings = Array.isArray(value.warnings)
    ? value.warnings.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined;
  return warnings ? { texts, warnings } : { texts };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== 'POST') {
      return errorResponse(requestId, 'method_not_allowed', 'Method not allowed', 405);
    }
    if (!env.OPENROUTER_API_KEY) {
      console.error(`[recipe-ai-proxy] id=${requestId} stage=config message=missing-api-key`);
      return errorResponse(requestId, 'server_misconfigured', 'Server misconfigured', 500);
    }

    try {
      const body = parseRequestBody(await request.json());
      const stageResult = await runStageWithFallback(env, body, requestId);
      if (body.mode === 'ocr_extract') {
        return jsonResponse(normalizeOcrOutput(stageResult.output));
      }
      return jsonResponse(normalizeMergeOutput(stageResult.output));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      const isValidationError =
        message.includes('Invalid request payload') ||
        message.includes('Unsupported mode') ||
        message.includes('Unsupported language') ||
        message.includes('At least one image is required') ||
        message.includes('Too many images') ||
        message.includes('Invalid image data') ||
        message.includes('Unsupported image type') ||
        message.includes('Context text is required');
      const isUpstreamError = error instanceof UpstreamStageError;
      const isParseError =
        message.includes('Unexpected model output') ||
        message.includes('Missing recipe object') ||
        message.includes('Empty provider response') ||
        message.includes('Unexpected OCR output') ||
        message.includes('Missing OCR texts') ||
        message.includes('Empty OCR texts');

      if (isValidationError) {
        console.error(`[recipe-ai-proxy] id=${requestId} stage=validate message=${message}`);
        return errorResponse(
          requestId,
          'bad_request',
          'Invalid scan request payload',
          400
        );
      }
      if (isUpstreamError) {
        const upstreamError = error as UpstreamStageError;
        console.error(
          `[recipe-ai-proxy] id=${requestId} stage=${upstreamError.stage} provider=${upstreamError.provider} message=${message}`
        );
        return errorResponse(
          requestId,
          'model_upstream_failed',
          'AI upstream call failed',
          502,
          { provider: upstreamError.provider, stage: upstreamError.stage }
        );
      }
      if (isParseError) {
        console.error(`[recipe-ai-proxy] id=${requestId} stage=parse message=${message}`);
        return errorResponse(
          requestId,
          'model_parse_failed',
          'AI response could not be parsed',
          502
        );
      }

      console.error(`[recipe-ai-proxy] id=${requestId} stage=unknown message=${message}`);
      return errorResponse(
        requestId,
        'scan_failed',
        'Failed to extract recipe from images',
        502
      );
    }
  },
};
