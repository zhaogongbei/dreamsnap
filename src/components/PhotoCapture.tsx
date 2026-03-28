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
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const { t } = useLanguage();

  const { addCapturedPhoto, clearPhotos, capturedPhotos } = useAppStore();

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Handler for camera ready
  const handleUserMedia = () => {
    console.log('Camera is ready');
    setCameraReady(true);
  };

  // Handler for camera error  
  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    setCameraError(t.cameraError);
    setCameraReady(false);
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    clearPhotos();

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            addCapturedPhoto(result);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== 0 || !isCapturing) return;

    const captureSequence = async () => {
      for (let i = 0; i < PHOTO_COUNT; i++) {
        setCurrentPhotoIndex(i + 1);
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          addCapturedPhoto(imageSrc);
        }
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
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [capturedPhotos.length, isCapturing, onComplete, mode]);

  useEffect(() => {
    if (capturedPhotos.length > 0 && mode === 'upload') {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [capturedPhotos.length, onComplete, mode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const videoConstraints = {
    width: isPortrait ? { ideal: 1080 } : { ideal: 1920 },
    height: isPortrait ? { ideal: 1920 } : { ideal: 1080 },
    facingMode: facingMode,
    aspectRatio: isPortrait ? 9 / 16 : 16 / 9,
  };

  const renderFileInput = () => (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      onChange={handleFileUpload}
      className="hidden"
    />
  );

  if (mode === 'upload') {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-2xl font-bold">{t.uploadFromGallery}</h2>
            <p className="text-gray-300 text-sm mt-1">{t.supportsFormats}</p>
          </div>
          <button
            onClick={() => setMode('camera')}
            className="px-4 py-2 bg-primary-600 rounded-lg text-white hover:bg-primary-500 transition-all"
          >
            {t.useCamera}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-80 border-4 border-dashed border-gray-500 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-800 transition-all"
          >
            {renderFileInput()}
            <svg
              className="w-20 h-20 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-300 text-lg font-medium">{t.tapToSelectPhotos}</p>
            <p className="text-gray-500 text-sm mt-2">{t.supportsFormats}</p>
          </div>

          {capturedPhotos.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-white text-lg">
                ✅ {capturedPhotos.length} {t.photosSelected}
              </p>
              <button
                onClick={() => {
                  clearPhotos();
                  fileInputRef.current?.click();
                }}
                className="mt-2 text-primary-400 hover:text-primary-300 text-sm"
              >
                {t.selectDifferentPhotos}
              </button>
            </div>
          )}
        </div>

        {capturedPhotos.length > 0 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={onComplete}
              className="px-8 py-4 bg-primary-600 text-white rounded-full text-lg font-semibold shadow-xl hover:bg-primary-500 transition-all"
            >
              {t.continue} →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {cameraError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
          <div className="text-center max-w-md">
            <svg
              className="w-16 h-16 text-red-400 mx-auto mb-4"
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
            <p className="mb-4 text-lg">{cameraError}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setCameraError(null);
                  window.location.reload();
                }}
                className="px-6 py-3 bg-primary-600 rounded-lg hover:bg-primary-500 transition-all"
              >
                {t.retryCamera}
              </button>
              <button
                onClick={() => {
                  setCameraError(null);
                  setMode('upload');
                }}
                className="px-6 py-3 bg-primary-600 rounded-lg hover:bg-primary-500 transition-all"
              >
                {t.uploadFromGallery}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {countdown !== null && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <div className="text-9xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {isCapturing && countdown === 0 && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold animate-pulse z-20">
              {t.loading} {currentPhotoIndex} / {PHOTO_COUNT}
            </div>
          )}

          {!isCapturing && countdown === null && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-0 border-4 border-white border-opacity-20 m-12 md:m-16 rounded-lg"></div>
            </div>
          )}

          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 flex flex-col items-center gap-6">
            <button
              onClick={toggleCamera}
              disabled={isCapturing}
              className="w-16 h-16 rounded-full bg-white bg-opacity-90 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-opacity-100 hover:scale-110 transition-all disabled:opacity-50 shadow-2xl border-2 border-white border-opacity-50"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>

            <button
              onClick={startCapture}
              disabled={isCapturing}
              className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all disabled:opacity-50 disabled:scale-100 border-4 border-white border-opacity-50"
            >
              <div className="w-20 h-20 rounded-full bg-primary-600 border-4 border-white shadow-inner"></div>
            </button>
          </div>

          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={() => setMode('upload')}
              className="w-14 h-14 rounded-full bg-white bg-opacity-90 backdrop-blur-md flex items-center justify-center text-gray-800 hover:bg-opacity-100 hover:scale-110 transition-all shadow-2xl border-2 border-white border-opacity-50"
              title={t.uploadFromGallery}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>

          {capturedPhotos.length > 0 && capturedPhotos.length < PHOTO_COUNT && !isCapturing && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              <p className="text-center text-white text-sm bg-black bg-opacity-30 backdrop-blur-sm py-2 px-4 rounded-full">
                {t.loading}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
