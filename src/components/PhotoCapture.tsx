import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useAppStore } from '@/stores/appStore';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhotoCaptureProps {
  onComplete: () => void;
}

const PHOTO_COUNT = 5;
const DELAY_BETWEEN_SHOTS = 250;

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onComplete }) => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const { t } = useLanguage();

  const { addCapturedPhoto, clearPhotos, capturedPhotos } = useAppStore();

  useEffect(() => {
    const handleUserMedia = () => setCameraReady(true);
    const handleUserMediaError = () => {
      setCameraError(t.cameraError);
      setCameraReady(false);
    };
    // Store handlers for cleanup (used as callbacks passed to Webcam)
    window.__dreamsnap_cameraReady = handleUserMedia;
    window.__dreamsnap_cameraError = handleUserMediaError;
    return () => {
      delete window.__dreamsnap_cameraReady;
      delete window.__dreamsnap_cameraError;
    };
  }, [t.cameraError]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    clearPhotos();
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) addCapturedPhoto(result);
        };
        reader.readAsDataURL(file);
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [clearPhotos, addCapturedPhoto]);

  const startCapture = useCallback(async () => {
    if (!webcamRef.current) return;
    clearPhotos();
    setIsCapturing(true);
    setCurrentPhotoIndex(0);
    setCountdown(3);
  }, [clearPhotos]);

  useEffect(() => {
    if (countdown === null || countdown === 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== 0 || !isCapturing) return;
    const captureSequence = async () => {
      for (let i = 0; i < PHOTO_COUNT; i++) {
        setCurrentPhotoIndex(i + 1);
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) addCapturedPhoto(imageSrc);
        if (i < PHOTO_COUNT - 1) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_SHOTS));
        }
      }
      setIsCapturing(false);
      setCurrentPhotoIndex(0);
    };
    captureSequence();
  }, [countdown, isCapturing, addCapturedPhoto]);

  useEffect(() => {
    if (capturedPhotos.length === PHOTO_COUNT && !isCapturing && mode === 'camera') {
      setTimeout(() => onComplete(), 500);
    }
  }, [capturedPhotos.length, isCapturing, onComplete, mode]);

  useEffect(() => {
    if (capturedPhotos.length > 0 && mode === 'upload') {
      setTimeout(() => onComplete(), 500);
    }
  }, [capturedPhotos.length, onComplete, mode]);

  const toggleCamera = () => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));

  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: facingMode,
  };

  // ========== Upload Mode ==========
  if (mode === 'upload') {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-white">{t.uploadFromGallery}</h2>
          <button onClick={() => setMode('camera')} className="text-primary-400 text-sm font-medium">
            {t.useCamera} →
          </button>
        </div>

        {/* Upload area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-sm aspect-[3/4] border-2 border-dashed border-white/15 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/40 hover:bg-surface-card transition-all"
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            <div className="w-16 h-16 rounded-2xl bg-surface-card flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-text-secondary text-base font-medium">{t.tapToSelectPhotos}</p>
            <p className="text-text-muted text-xs mt-1">{t.supportsFormats}</p>
          </div>

          {capturedPhotos.length > 0 && (
            <p className="mt-4 text-primary-400 font-medium">
              ✅ {capturedPhotos.length} {t.photosSelected}
            </p>
          )}
        </div>

        {/* Bottom action */}
        {capturedPhotos.length > 0 && (
          <div className="px-6 pb-10 pt-4">
            <button onClick={onComplete} className="btn-primary w-full text-base">
              {t.continue} →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ========== Camera Error ==========
  if (cameraError) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-text-secondary mb-6">{cameraError}</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setCameraError(null); window.location.reload(); }} className="btn-primary w-full">
              {t.retryCamera}
            </button>
            <button onClick={() => { setCameraError(null); setMode('upload'); }} className="btn-secondary w-full">
              {t.uploadFromGallery}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== Camera Mode ==========
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Camera feed */}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.9}
        videoConstraints={videoConstraints}
        onUserMedia={window.__dreamsnap_cameraReady}
        onUserMediaError={window.__dreamsnap_cameraError}
        className="absolute inset-0 w-full h-full object-cover"
        mirrored={facingMode === 'user'}
      />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Countdown */}
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-8xl font-bold text-white/90 drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {/* Capturing indicator */}
      {isCapturing && countdown === 0 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-5 py-2.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">
              {currentPhotoIndex} / {PHOTO_COUNT}
            </span>
          </div>
        </div>
      )}

      {/* Top bar - subtle */}
      <div className="absolute top-0 left-0 right-0 z-20 p-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode('upload')}
            className="camera-ctrl-btn"
            title={t.uploadFromGallery}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button onClick={toggleCamera} disabled={isCapturing} className="camera-ctrl-btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom controls - centered shutter */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 pt-6">
        <div className="flex items-center justify-center gap-8">
          {/* Spacer for symmetry (or could add gallery) */}
          <div className="w-12 h-12" />

          {/* Shutter button */}
          <button
            onClick={startCapture}
            disabled={isCapturing}
            className="shutter-btn disabled:opacity-50"
          >
            <div className="shutter-btn-inner" />
          </button>

          {/* Spacer */}
          <div className="w-12 h-12" />
        </div>
      </div>

      {/* Loading after capture */}
      {capturedPhotos.length > 0 && capturedPhotos.length < PHOTO_COUNT && !isCapturing && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
          <p className="text-white/70 text-sm bg-black/30 backdrop-blur-sm py-2 px-4 rounded-full">
            {t.loading}
          </p>
        </div>
      )}
    </div>
  );
};
