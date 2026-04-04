import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LanguageProvider, LanguageSwitcher, useLanguage } from '@/contexts/LanguageContext';
import { sendPhotoToFeishu, sendTextToFeishu, createFeishuMessage } from '@/lib/feishu';
import { WeChatGuide } from '@/components/WeChatGuide';

// Components
import { PhotoCapture } from '@/components/PhotoCapture';
import { PhotoSelection } from '@/components/PhotoSelection';
import { ThemeSelection } from '@/components/ThemeSelection';
import { AIGeneration } from '@/components/AIGeneration';
import { ImagePreview } from '@/components/ImagePreview';

// Pages
import { GalleryPage } from '@/pages/GalleryPage';
import { LoginPage } from '@/pages/LoginPage';
import { AssetsPage } from '@/pages/AssetsPage';

type Step =
  | 'capture'
  | 'select'
  | 'theme'
  | 'generate'
  | 'preview'
  | 'success';

function MainFlow() {
  const [currentStep, setCurrentStep] = useState<Step>('capture');
  const [error, setError] = useState<string | null>(null);
  const { resetCapture } = useAppStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleStartOver = () => {
    resetCapture();
    setError(null);
    setCurrentStep('capture');
  };

  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setCurrentStep('generate');
  };

  const { finalImage, selectedTheme, capturedPhotos } = useAppStore();

  const handleImageApprove = async () => {
    // Send photo to Feishu before showing success
    if (finalImage && selectedTheme) {
      try {
        // Get first captured photo for name (or use default)
        const photoCount = capturedPhotos?.length || 0;
        const message = createFeishuMessage(`用户 ${photoCount + 1}`, selectedTheme.name || 'Unknown');
        
        await sendPhotoToFeishu({
          imageBase64: finalImage,
          caption: message,
        });
        console.log('✅ Photo notification sent to Feishu');
      } catch (error) {
        console.error('❌ Failed to send to Feishu:', error);
      }
    }
    
    // Go to success page
    setCurrentStep('success');
  };

  return (
    <div className="min-h-screen">
      {/* Floating nav buttons - show on all steps except capture */}
      {currentStep !== 'capture' && (
        <div className="fixed top-5 left-5 z-40 pointer-events-none">
          <div className="pointer-events-auto flex flex-col gap-2.5">
            <LanguageSwitcher />
            <button
              onClick={() => navigate('/assets')}
              className="px-4 py-2.5 bg-surface-card backdrop-blur-xl border border-border-subtle text-white rounded-xl hover:bg-surface-card-hover transition-all text-xs font-medium flex items-center gap-1.5 shadow-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t.myAssets}
            </button>
            <button
              onClick={() => navigate('/gallery')}
              className="px-4 py-2.5 bg-surface-card backdrop-blur-xl border border-border-subtle text-white rounded-xl hover:bg-surface-card-hover transition-all text-xs font-medium flex items-center gap-1.5 shadow-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {t.gallery}
            </button>
          </div>
        </div>
      )}


      {/* Error display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step components */}
      {currentStep === 'capture' && (
        <PhotoCapture onComplete={() => setCurrentStep('select')} />
      )}

      {currentStep === 'select' && (
        <PhotoSelection
          onNext={() => setCurrentStep('theme')}
          onBack={() => setCurrentStep('capture')}
        />
      )}

      {currentStep === 'theme' && (
        <ThemeSelection
          onNext={() => setCurrentStep('generate')}
          onBack={() => setCurrentStep('select')}
        />
      )}

      {currentStep === 'generate' && (
        <AIGeneration
          onComplete={() => setCurrentStep('preview')}
          onError={handleGenerationError}
        />
      )}

      {currentStep === 'preview' && (
        <ImagePreview
          onApprove={handleImageApprove}
          onRetry={() => setCurrentStep('theme')}
        />
      )}

      {currentStep === 'success' && (
        <div className="min-h-screen bg-surface flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-7xl mb-6">✨</div>
            <h1 className="text-3xl font-bold text-white mb-3">{t.successTitle}</h1>
            <p className="text-text-secondary mb-10">{t.photoSaved}</p>
            <button
              onClick={handleStartOver}
              className="btn-primary text-base px-10"
            >
              {t.createAnother}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { resetCapture } = useAppStore();

  const handleStartNew = () => {
    resetCapture();
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <GalleryPage onStartNew={handleStartNew} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <AssetsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <WeChatGuide />
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
