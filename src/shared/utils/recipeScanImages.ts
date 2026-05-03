import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';
import { persistImage } from '@shared/utils/images';
import type { RecipeScanImagePayload } from '@application/services/recipeImageAutofill';

export interface PreparedRecipeScanImages {
  readonly images: ReadonlyArray<RecipeScanImagePayload>;
  readonly primaryImageUri: string | undefined;
}

interface RecipeImagePreset {
  readonly maxLongEdge: number;
  readonly compress: number;
}

const preset: RecipeImagePreset = {
  maxLongEdge: 1_280,
  compress: 0.7,
};

export const MAX_SCAN_IMAGES = 5;
export const OCR_EXTRACT_BATCH_SIZE = 2;

function getResizedDimensions(width: number, height: number): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  if (longEdge <= preset.maxLongEdge) {
    return { width, height };
  }

  const ratio = preset.maxLongEdge / longEdge;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function prepareSingleImage(asset: ImagePickerAsset): Promise<{ payload: RecipeScanImagePayload; optimizedUri: string }> {
  const sourceWidth = asset.width ?? preset.maxLongEdge;
  const sourceHeight = asset.height ?? preset.maxLongEdge;
  const { width, height } = getResizedDimensions(sourceWidth, sourceHeight);
  const optimized = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width, height } }],
    {
      compress: preset.compress,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  const base64Data = await FileSystem.readAsStringAsync(optimized.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    payload: {
      base64Data,
      mimeType: 'image/jpeg',
    },
    optimizedUri: optimized.uri,
  };
}

export async function prepareRecipeScanImages(
  assets: ReadonlyArray<ImagePickerAsset>
): Promise<PreparedRecipeScanImages> {
  const selected = assets.slice(0, MAX_SCAN_IMAGES);
  const prepared = await Promise.all(selected.map((asset) => prepareSingleImage(asset)));
  if (prepared.length === 0) {
    return {
      images: [],
      primaryImageUri: undefined,
    };
  }

  const primaryImageUri = await persistImage(prepared[0].optimizedUri);
  return {
    images: prepared.map((item) => item.payload),
    primaryImageUri,
  };
}
