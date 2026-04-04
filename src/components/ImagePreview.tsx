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

  if (!finalImage) return null;

  const handleSaveToAssets = async () => {
    if (!selectedPhoto || !selectedTheme || !generatedImage) {
      setSaveError(t.missingPhotoOrTheme);
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const createThumbnail = (base64: string, maxSize: number = 300): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas error')); return; }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = () => reject(new Error('Load error'));
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
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : t.failedToSave);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Full-screen image preview */}
      <div
        className="flex-1 relative cursor-pointer flex items-center justify-center bg-black/30"
        onClick={() => setIsZoomed(true)}
      >
        <img
          src={finalImage}
          alt={t.yourTransformation}
          className="w-full h-auto max-h-[70vh] object-contain"
        />
        {/* Theme label */}
        <div className="absolute top-5 left-5 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5">
          <span className="text-white/80 text-xs font-medium">
            {t.theme}：{t[selectedTheme?.name as keyof typeof t] || selectedTheme?.name}
          </span>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="bg-surface border-t border-border-subtle rounded-t-3xl -mt-4 relative z-10">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-6 pb-8">
          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-5">{t.yourTransformation}</h2>

          {/* Action buttons */}
          <div className="flex gap-3 mb-4">
            <button onClick={onRetry} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.tryAnotherTheme}
            </button>
            <button onClick={() => setShowPrintDialog(true)} className="btn-secondary flex items-center justify-center gap-2 text-sm px-5">
              🖨️
            </button>
            <button onClick={onApprove} className="btn-primary flex-[1.5] flex items-center justify-center gap-2 text-sm">
              {t.loveItContinue}
            </button>
          </div>

          {/* Save to assets */}
          <div className="border-t border-border-subtle pt-4">
            {saveError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm mb-3">
                {saveError}
              </div>
            )}
            {savedToAssets ? (
              <div className="flex items-center justify-center gap-2 text-primary-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.savedToAssets}
              </div>
            ) : (
              <button
                onClick={handleSaveToAssets}
                disabled={isSaving}
                className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors py-2 flex items-center justify-center gap-2 disabled:text-text-muted"
              >
                {isSaving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
                {isSaving ? t.saving : t.saveToAssets}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zoomed modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
          <img src={finalImage} alt="Zoomed" className="max-w-full max-h-[95vh] object-contain rounded-2xl" />
          <p className="absolute bottom-8 text-white/50 text-sm">{t.clickToClose}</p>
        </div>
      )}

      {/* Print Dialog */}
      {showPrintDialog && finalImage && (
        <PrintDialog imageBase64={finalImage} onClose={() => setShowPrintDialog(false)} onPrintStart={() => {}} onPrintComplete={() => {}} />
      )}
    </div>
  );
};
