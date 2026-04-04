import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { addAsset } from '@/lib/assets';
import { useLanguage } from '@/contexts/LanguageContext';
import { CyberGlassCard, CyberButton, CyberGridBackground } from './CyberComponents';

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
    <div className="min-h-screen cyber-theme relative">
      <CyberGridBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Full-screen image preview */}
        <div
          className="flex-1 relative cursor-pointer flex items-center justify-center p-4 pt-12"
          onClick={() => setIsZoomed(true)}
        >
          {/* Decorative frame */}
          <div className="absolute inset-4 border-2 border-cyan-400/20 rounded-3xl pointer-events-none" />

          {/* Corner accents */}
          <div className="absolute top-8 left-4 w-12 h-12 border-l-2 border-t-2 border-cyan-400/50 rounded-tl-xl" />
          <div className="absolute top-8 right-4 w-12 h-12 border-r-2 border-t-2 border-pink-400/50 rounded-tr-xl" />
          <div className="absolute bottom-8 left-4 w-12 h-12 border-l-2 border-b-2 border-pink-400/50 rounded-bl-xl" />
          <div className="absolute bottom-8 right-4 w-12 h-12 border-r-2 border-b-2 border-cyan-400/50 rounded-br-xl" />

          {/* Image container */}
          <div className="relative max-w-md w-full">
            {/* Glow behind image */}
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 blur-2xl rounded-3xl" />

            <img
              src={finalImage}
              alt={t.yourTransformation}
              className="relative w-full h-auto rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>

          {/* Theme label */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md rounded-full px-5 py-2 border border-gray-700/50">
            <span className="text-white/80 text-sm font-medium">
              {t.theme}：{t[selectedTheme?.name as keyof typeof t] || selectedTheme?.name}
            </span>
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-gray-500 text-xs">
            {t.tapToZoom}
          </div>
        </div>

        {/* Bottom panel */}
        <div className="cyber-panel-bg bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent pt-6 pb-8 px-5">
          {/* Handle bar */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 rounded-full bg-gray-700" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-4 text-center relative">
            <span className="relative z-10">{t.yourTransformation}</span>
            <span className="absolute inset-0 text-cyan-400/50 blur-sm">{t.yourTransformation}</span>
          </h2>

          {/* Action buttons */}
          <div className="flex gap-3 mb-4">
            <CyberButton variant="secondary" size="md" onClick={onRetry} className="flex-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.tryAnotherTheme}
            </CyberButton>
            <CyberButton variant="primary" size="md" onClick={onApprove} className="flex-[1.5]">
              {t.loveItContinue}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </CyberButton>
          </div>

          {/* Save to assets */}
          <div className="border-t border-gray-800/50 pt-4">
            {saveError && (
              <div className="bg-pink-500/10 border border-pink-500/30 text-pink-400 px-4 py-2.5 rounded-xl text-sm mb-3">
                {saveError}
              </div>
            )}
            {savedToAssets ? (
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.savedToAssets}
              </div>
            ) : (
              <button
                onClick={handleSaveToAssets}
                disabled={isSaving}
                className="w-full text-sm text-gray-400 hover:text-cyan-400 transition-colors py-2 flex items-center justify-center gap-2 disabled:text-gray-600"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t.saving}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {t.saveToAssets}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zoomed modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          {/* Decorative corners */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-cyan-400/50 rounded-tl-xl" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-pink-400/50 rounded-tr-xl" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-pink-400/50 rounded-bl-xl" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-cyan-400/50 rounded-br-xl" />

          <img
            src={finalImage}
            alt="Zoomed"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
          <p className="absolute bottom-12 left-1/2 -translate-x-1/2 text-gray-500 text-sm">{t.clickToClose}</p>
        </div>
      )}
    </div>
  );
};
