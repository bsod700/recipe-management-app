import * as FileSystem from 'expo-file-system/legacy';

const RECIPE_IMAGES_DIR = `${FileSystem.documentDirectory}recipe-images/`;

/**
 * Ensure our private image directory exists. Cheap no-op after first call.
 */
export async function ensureImageDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(RECIPE_IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(RECIPE_IMAGES_DIR, {
      intermediates: true,
    });
  }
}

/**
 * Copy a picked image URI (usually from cache) into the app's persistent
 * document directory, so it survives OS cache clears.
 * Returns the new file URI to store in SQLite.
 */
export async function persistImage(sourceUri: string): Promise<string> {
  await ensureImageDir();
  const ext = sourceUri.split('.').pop()?.split('?')[0] || 'jpg';
  const target = `${RECIPE_IMAGES_DIR}${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: sourceUri, to: target });
  return target;
}

export async function deleteImage(uri: string | undefined | null): Promise<void> {
  if (!uri) return;
  if (!uri.startsWith(RECIPE_IMAGES_DIR)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // swallow — image cleanup is best-effort.
  }
}
