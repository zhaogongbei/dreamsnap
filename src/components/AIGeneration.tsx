import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { generateImageWithGemini } from '@/lib/gemini';
import { overlayWatermarkOnImage } from '@/lib/imageUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIGenerationProps {
  onComplete: () => void;
  onError: (error: string) => void;
}

const steps = [
  { key: 'compressing', icon: '📦' },
  { key: 'analyzing', icon: '🔍' },
  { key: 'applying', icon: '🎨' },
  { key: 'polishing', icon: '✨' },
  { key: 'finishing', icon: '🖼️' },
];

export const AIGeneration: React.FC<AIGenerationProps> = ({ onComplete, onError }) => {
  const { selectedPhoto, selectedTheme, setGeneratedImage, setFinalImage } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const hasStartedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
      setCurrentStep(0);
      setProgress(10);
      await new Promise((r) => setTimeout(r, 600));

      setCurrentStep(1);
      setProgress(20);
      await new Promise((r) => setTimeout(r, 400));

      setCurrentStep(2);
      setProgress(35);
      const themeName = t[selectedTheme.name as keyof typeof t] || selectedTheme.name;

      const generatedImage = await generateImageWithGemini({
        imageBase64: selectedPhoto,
        prompt: selectedTheme.promptTemplate,
        referenceImageUrl: selectedTheme.referenceImage,
      });

      setCurrentStep(3);
      setProgress(75);
      setGeneratedImage(generatedImage);
      await new Promise((r) => setTimeout(r, 500));

      setCurrentStep(4);
      setProgress(90);
      const watermarkUrl = import.meta.env.VITE_WATERMARK_IMAGE_URL || '/frames/default-frame.png';
      try {
        const finalImage = await overlayWatermarkOnImage(generatedImage, watermarkUrl);
        setFinalImage(finalImage);
      } catch {
        setFinalImage(generatedImage);
      }

      setProgress(100);
      setIsProcessing(false);
      if (timerRef.current) clearInterval(timerRef.current);
      await new Promise((r) => setTimeout(r, 600));
      onComplete();
    } catch (error) {
      console.error('Error generating image:', error);
      setErrorMsg(error instanceof Error ? error.message : t.failedToSave);
      setIsProcessing(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Error state
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">{t.generationFailed}</h2>
          <div className="bg-surface-light rounded-xl p-3 mb-6">
            <p className="text-red-400/80 text-xs font-mono break-all">{errorMsg}</p>
          </div>
          <button onClick={generateImage} className="btn-primary w-full mb-3">
            {t.retry}
          </button>
          <button onClick={() => onError(errorMsg)} className="btn-secondary w-full text-sm">
            {t.chooseDifferentTheme}
          </button>
        </div>
      </div>
    );
  }

  // Processing state
  const stepLabels = [
    t.compressingPhoto,
    t.analyzingPhoto,
    `${t.applyingStyle} ${t[selectedTheme?.name as keyof typeof t] || ''}`,
    t.addingTouches,
    t.applyingWatermark,
  ];

  // SVG circle progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      {/* Circular progress */}
      <div className="relative w-40 h-40 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          {/* Track */}
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="70" cy="70" r={radius} fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6C5CE7" />
              <stop offset="100%" stopColor="#FF6B9D" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl mb-1">{steps[currentStep]?.icon || '✨'}</span>
          <span className="text-2xl font-bold text-white">{progress}%</span>
        </div>
      </div>

      {/* Status text */}
      <h2 className="text-xl font-bold text-white mb-1">{t.creatingMagic}</h2>
      <p className="text-text-secondary text-sm mb-6">{stepLabels[currentStep]}</p>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-8">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i < currentStep ? 'bg-primary-500' :
              i === currentStep ? 'bg-primary-400 scale-125' :
              'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Info card */}
      <div className="card px-5 py-4 max-w-xs w-full">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <span className="text-text-muted">⏱</span>
          <span>{t.elapsedTime}：{formatTime(elapsedTime)}</span>
        </div>
        <p className="text-text-muted text-xs mt-3 leading-relaxed">
          {t.aiGenerationTime}
        </p>
      </div>
    </div>
  );
};
