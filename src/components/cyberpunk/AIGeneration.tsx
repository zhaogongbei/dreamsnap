import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { generateImageWithGemini } from '@/lib/gemini';
import { overlayWatermarkOnImage } from '@/lib/imageUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { CyberProgressRing, CyberGlassCard, CyberButton, CyberGridBackground } from './CyberComponents';

interface AIGenerationProps {
  onComplete: () => void;
  onError: (error: string) => void;
}

const steps = [
  { key: 'compressing', icon: '📦', label: 'Compress' },
  { key: 'analyzing', icon: '🔍', label: 'Analyze' },
  { key: 'applying', icon: '🎨', label: 'Apply' },
  { key: 'polishing', icon: '✨', label: 'Polish' },
  { key: 'finishing', icon: '🖼️', label: 'Finish' },
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
      <div className="min-h-screen cyber-theme relative">
        <CyberGridBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <CyberGlassCard className="p-8 max-w-sm w-full text-center" glow="pink">
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t.generationFailed}</h2>
            <div className="bg-gray-900/50 rounded-xl p-3 mb-6 max-h-32 overflow-auto">
              <p className="text-pink-400/80 text-xs font-mono break-all">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-3">
              <CyberButton variant="primary" onClick={generateImage} className="w-full">
                {t.retry}
              </CyberButton>
              <CyberButton variant="secondary" onClick={() => onError(errorMsg)} className="w-full">
                {t.chooseDifferentTheme}
              </CyberButton>
            </div>
          </CyberGlassCard>
        </div>
      </div>
    );
  }

  // Processing state
  const statusLabels = [
    t.compressingPhoto,
    t.analyzingPhoto,
    `${t.applyingStyle} ${t[selectedTheme?.name as keyof typeof t] || ''}`,
    t.addingTouches,
    t.applyingWatermark,
  ];

  return (
    <div className="min-h-screen cyber-theme relative">
      <CyberGridBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Animated logo */}
        <div className="mb-8 animate-float">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center"
              style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {/* Orbiting particles */}
            <div className="absolute inset-0 -m-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-pink-400 animate-ping" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-8 relative">
          <span className="relative z-10">{t.creatingMagic}</span>
          <span className="absolute inset-0 text-cyan-400/50 blur-sm animate-pulse">{t.creatingMagic}</span>
        </h2>

        {/* Progress ring */}
        <CyberProgressRing
          progress={progress}
          status={statusLabels[currentStep]}
          elapsedTime={formatTime(elapsedTime)}
        />

        {/* Steps indicator */}
        <div className="flex gap-3 mt-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-lg
                transition-all duration-500
                ${i < currentStep
                  ? 'bg-gradient-to-br from-cyan-500 to-cyan-400 text-gray-900'
                  : i === currentStep
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white scale-110'
                    : 'bg-gray-800/50 text-gray-500'
                }
              `}
            >
              {i < currentStep ? '✓' : step.icon}
            </div>
          ))}
        </div>

        {/* Info card */}
        <CyberGlassCard className="mt-8 px-6 py-4 max-w-xs w-full" glow="cyan">
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{t.pleaseWait}</span>
          </div>
          <p className="text-gray-500 text-xs mt-2 leading-relaxed">
            {t.aiGenerationTime}
          </p>
        </CyberGlassCard>

        {/* Decorative corner elements */}
        <div className="absolute top-20 left-8 w-16 h-16 border-l-2 border-t-2 border-cyan-400/20 rounded-tl-xl" />
        <div className="absolute top-20 right-8 w-16 h-16 border-r-2 border-t-2 border-pink-400/20 rounded-tr-xl" />
        <div className="absolute bottom-32 left-8 w-16 h-16 border-l-2 border-b-2 border-pink-400/20 rounded-bl-xl" />
        <div className="absolute bottom-32 right-8 w-16 h-16 border-r-2 border-b-2 border-cyan-400/20 rounded-br-xl" />
      </div>
    </div>
  );
};
