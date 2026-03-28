import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { addAsset } from '@/lib/assets';
import { PrintDialog } from './PrintDialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImagePreviewProps {
  onApprove: () => void;
  onRetry: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ onApprove, onRetry }) => {
  const { finalImage, selectedPhoto, selectedTheme, generatedImage } = useAppStore();
  const { t } = useLanguage();
  const [isZoomed, setIsZoomed] = useState(false);
  const [savedToAssets, setSavedToAssets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  if (!finalImage) {
    return null;
  }

  const handleSaveToAssets = async () => {
    if (!selectedPhoto || !selectedTheme || !generatedImage) {
      setSaveError('Missing photo or theme data');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Create a thumbnail from the original photo
      const createThumbnail = (base64: string, maxSize: number = 300): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = base64;
        });
      };

      const thumbnail = await createThumbnail(selectedPhoto);
      
      await addAsset({
        themeName: selectedTheme.name,
        originalPhoto: thumbnail,
        generatedImage: generatedImage,
        finalImage: finalImage,
        prompt: selectedTheme.promptTemplate,
      });

      setSavedToAssets(true);
      setIsSaving(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save to assets';
      setSaveError(message);
      setIsSaving(false);
      console.error('Save error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 py-12">
      <div className="card max-w-4xl w-full">
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
          Your Magical Transformation
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Theme: <span className="font-semibold">{selectedTheme?.name}</span>
        </p>

        {/* Image preview */}
        <div className="mb-8">
          <div
            className={`relative rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-transform ${
              isZoomed ? 'scale-105' : ''
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={finalImage}
              alt="Generated photo with frame"
              className="w-full h-auto"
            />

            {/* Zoom indicator */}
            {!isZoomed && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-3 py-2 rounded-full">
                <svg
                  className="w-4 h-4 inline-block mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
                Tap to zoom
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onRetry} className="btn-secondary">
            <svg
              className="w-5 h-5 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t.tryAnotherTheme}
          </button>

          <button onClick={() => setShowPrintDialog(true)} className="btn-secondary">
            <svg
              className="w-5 h-5 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            🖨️ 打印
          </button>

          <button onClick={onApprove} className="btn-primary text-lg px-10">
            <svg
              className="w-6 h-6 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {t.loveItContinue}
          </button>
        </div>

        {/* Save to Assets section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          {saveError && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-1">Failed to save</p>
              <p className="text-sm">{saveError}</p>
            </div>
          )}

          {savedToAssets ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-2 text-green-600 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved to My Assets ✨
              </div>
              <p className="text-sm text-gray-500 mt-2">
                View it anytime in the Assets page
              </p>
            </div>
          ) : (
            <button
              onClick={handleSaveToAssets}
              disabled={isSaving}
              className={`w-full text-sm font-medium transition-colors py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                isSaving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save to My Assets
                </>
              )}
            </button>
          )}
        </div>

        {/* Info text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Next: Share your details to get your photo and post to Instagram
          </p>
        </div>
      </div>

      {/* Zoomed modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="max-w-6xl w-full">
            <img
              src={finalImage}
              alt="Zoomed photo"
              className="w-full h-auto rounded-lg"
            />
            <p className="text-white text-center mt-4">{t.clickToClose}</p>
          </div>
        </div>
      )}

      {/* Print Dialog */}
      {showPrintDialog && finalImage && (
        <PrintDialog
          imageBase64={finalImage}
          onClose={() => setShowPrintDialog(false)}
          onPrintStart={() => console.log('Printing started')}
          onPrintComplete={() => console.log('Printing completed')}
        />
      )}
    </div>
  );
};
