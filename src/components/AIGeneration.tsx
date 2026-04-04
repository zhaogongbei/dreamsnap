import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { generateImageWithGemini } from '@/lib/gemini';
import { overlayWatermarkOnImage } from '@/lib/imageUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIGenerationProps {
  onComplete: () => void;
  onError: (error: string) => void;
}

export const AIGeneration: React.FC<AIGenerationProps> = ({ onComplete, onError }) => {
  const { selectedPhoto, selectedTheme, setGeneratedImage, setFinalImage } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing AI...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Timer for elapsed time
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    generateImage();
  }, []);

  const generateImage = async () => {
    if (!selectedPhoto || !selectedTheme) {
      onError(t.missingPhotoOrTheme);
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      setStatus(t.compressingPhoto);
      setProgress(10);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setStatus(t.analyzingPhoto);
      setProgress(20);

      const themeName = t[selectedTheme.name as keyof typeof t] || selectedTheme.name;
      setStatus(`${t.applyingStyle} ${themeName}`);
      setProgress(30);

      // Generate AI image with Gemini
      const generatedImage = await generateImageWithGemini({
        imageBase64: selectedPhoto,
        prompt: selectedTheme.promptTemplate,
        referenceImageUrl: selectedTheme.referenceImage,
      });

      setProgress(70);
      setStatus(t.addingTouches);
      setGeneratedImage(generatedImage);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress(85);
      setStatus(t.applyingWatermark);

      const watermarkUrl = import.meta.env.VITE_WATERMARK_IMAGE_URL || '/frames/default-frame.png';

      try {
        const finalImage = await overlayWatermarkOnImage(generatedImage, watermarkUrl);
        setFinalImage(finalImage);
      } catch (watermarkError) {
        console.warn('Watermark overlay failed, using image without watermark:', watermarkError);
        setFinalImage(generatedImage);
      }

      setProgress(100);
      setStatus('Complete!');
      setIsProcessing(false);
      if (timerRef.current) clearInterval(timerRef.current);

      await new Promise((resolve) => setTimeout(resolve, 500));
      onComplete();
    } catch (error) {
      console.error('Error generating image:', error);
      const message = error instanceof Error ? error.message : t.failedToSave;
      setErrorMsg(message);
      setStatus(t.generationFailed);
      setIsProcessing(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Error state
  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="card max-w-2xl w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-block bg-red-100 rounded-full p-4 mb-4">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">{t.generationFailed}</h2>
            <div className="bg-gray-900 text-red-400 p-4 rounded-lg font-mono text-xs text-left max-h-40 overflow-auto">
              {errorMsg}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={generateImage} className="btn-primary w-full py-4 text-lg">
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t.retry}
            </button>
            <button onClick={() => onError(errorMsg)} className="btn-secondary w-full">
              {t.chooseDifferentTheme}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal processing state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="card max-w-2xl w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block relative mb-6">
            <div className="w-32 h-32 rounded-full border-8 border-primary-200 border-t-primary-600 animate-spin shadow-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-4 shadow-xl">
                <svg
                  className="w-12 h-12 text-primary-600 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
            {t.creatingMagic}
          </h2>
          <p className="text-gray-700 text-xl mb-2 font-medium">{status}</p>
          <p className="text-gray-400 text-sm">⏱️ {t.elapsedTime}: {formatTime(elapsedTime)}</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-6 mt-4 mb-4 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary-600 via-pink-500 to-pink-600 transition-all duration-500 ease-out rounded-full shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-lg font-bold text-gray-700">{progress}% 完成</p>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-primary-50 to-pink-50 rounded-2xl p-6 border-2 border-primary-200 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center text-lg">
            <div className="bg-gradient-to-r from-primary-600 to-pink-600 rounded-full p-2 mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            {t.pleaseWait}
          </h3>
          <p className="text-gray-700 text-base leading-relaxed">
            {t.aiGenerationTime}
          </p>
        </div>
      </div>
    </div>
  );
};
