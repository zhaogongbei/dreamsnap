// Local asset storage for DreamSnap generation history
// Uses localStorage to persist records across sessions

export interface AssetRecord {
  id: string;
  createdAt: string;
  themeName: string;
  originalPhoto: string; // base64 thumbnail
  generatedImage: string; // base64
  finalImage?: string; // base64 with watermark
  prompt: string;
}

const STORAGE_KEY = 'dreamsnap_assets';
const MAX_ASSETS = 50;
const MAX_STORAGE_MB = 45; // 45MB limit for localStorage

function getStorageSize(): number {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total / (1024 * 1024); // Convert to MB
}

function loadAssets(): AssetRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load assets:', e);
    return [];
  }
}

function saveAssets(assets: AssetRecord[]) {
  try {
    const json = JSON.stringify(assets);
    localStorage.setItem(STORAGE_KEY, json);
    console.log('Assets saved successfully. Storage used:', getStorageSize().toFixed(2), 'MB');
  } catch (e) {
    console.error('Failed to save assets to localStorage:', e);
    if (e instanceof Error && e.message.includes('QuotaExceededError')) {
      throw new Error('Storage full. Please delete some old records.');
    }
    throw e;
  }
}

/**
 * Compress base64 image to reduce storage size
 */
async function compressBase64(base64: string, quality: number = 0.6): Promise<string> {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });
}

/**
 * Add a new generated image to local assets
 */
export async function addAsset(record: Omit<AssetRecord, 'id' | 'createdAt'>): Promise<AssetRecord> {
  try {
    console.log('Adding asset to storage...');
    
    // Check storage before adding
    const currentSize = getStorageSize();
    console.log('Current storage:', currentSize.toFixed(2), 'MB');

    if (currentSize > MAX_STORAGE_MB) {
      throw new Error(`Storage limit exceeded (${currentSize.toFixed(1)}MB / ${MAX_STORAGE_MB}MB). Please delete old records.`);
    }

    // Compress images to reduce size
    console.log('Compressing images...');
    const compressedOriginal = await compressBase64(record.originalPhoto, 0.5);
    const compressedGenerated = await compressBase64(record.generatedImage, 0.7);
    const compressedFinal = record.finalImage ? await compressBase64(record.finalImage, 0.7) : undefined;

    const assets = loadAssets();
    const newAsset: AssetRecord = {
      ...record,
      originalPhoto: compressedOriginal,
      generatedImage: compressedGenerated,
      finalImage: compressedFinal,
      id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    assets.unshift(newAsset);

    // Keep only the latest MAX_ASSETS
    while (assets.length > MAX_ASSETS) {
      assets.pop();
    }

    saveAssets(assets);
    console.log('✅ Asset saved successfully!');
    return newAsset;
  } catch (e) {
    console.error('Error adding asset:', e);
    throw e;
  }
}

/**
 * Get all local assets, newest first
 */
export function getAssets(): AssetRecord[] {
  return loadAssets();
}

/**
 * Get a single asset by ID
 */
export function getAssetById(id: string): AssetRecord | null {
  const assets = loadAssets();
  return assets.find((a) => a.id === id) || null;
}

/**
 * Delete an asset by ID
 */
export function deleteAsset(id: string): boolean {
  try {
    const assets = loadAssets();
    const filtered = assets.filter((a) => a.id !== id);
    if (filtered.length === assets.length) return false;
    saveAssets(filtered);
    console.log('Asset deleted. New storage size:', getStorageSize().toFixed(2), 'MB');
    return true;
  } catch (e) {
    console.error('Error deleting asset:', e);
    return false;
  }
}

/**
 * Clear all local assets
 */
export function clearAssets() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('All assets cleared');
  } catch (e) {
    console.error('Error clearing assets:', e);
  }
}

/**
 * Get storage statistics
 */
export function getStorageStats() {
  const assets = loadAssets();
  const usedMB = getStorageSize();
  return {
    assetCount: assets.length,
    usedMB: parseFloat(usedMB.toFixed(2)),
    maxMB: MAX_STORAGE_MB,
    percentUsed: Math.round((usedMB / MAX_STORAGE_MB) * 100),
  };
}
