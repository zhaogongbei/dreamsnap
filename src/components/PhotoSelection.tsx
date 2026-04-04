import { useState, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhotoSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const PhotoSelection: React.FC<PhotoSelectionProps> = ({ onNext }) => {
  const { capturedPhotos, selectedPhoto, selectPhoto } = useAppStore();
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const handleSelect = (photo: string, index: number) => {
    selectPhoto(photo);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[index]?.clientWidth || 200;
      scrollRef.current.scrollTo({
        left: index * (cardWidth + 12) - (scrollRef.current.clientWidth / 2) + (cardWidth / 2),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-white">{t.selectBestPhoto}</h1>
        <p className="text-text-secondary text-sm mt-1">{t.chooseBestPhoto}</p>
      </div>

      {/* Horizontal scroll photo strip */}
      <div className="px-5 py-4">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {capturedPhotos.map((photo, index) => (
            <div
              key={index}
              onClick={() => handleSelect(photo, index)}
              className={`flex-shrink-0 w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 snap-center border-2 ${
                selectedPhoto === photo
                  ? 'border-primary-500 scale-105 shadow-lg shadow-primary-500/30'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20'
              }`}
            >
              <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              {/* Number badge */}
              <div className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                selectedPhoto === photo
                  ? 'bg-primary-500 text-white'
                  : 'bg-black/40 text-white/70'
              }`} style={{ position: 'relative', marginTop: '-40px', marginLeft: '4px' }}>
                {index + 1}
              </div>
              {/* Check mark */}
              {selectedPhoto === photo && (
                <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected photo preview */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4">
        {selectedPhoto ? (
          <div className="w-full max-w-md">
            <div
              onClick={() => setViewIndex(capturedPhotos.indexOf(selectedPhoto))}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-border-subtle cursor-pointer"
            >
              <img src={selectedPhoto} alt="Selected" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5">
                <span className="text-white/80 text-xs">{t.tapToZoom}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-surface-card flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-text-muted text-sm">{t.tapPhotoToSelect}</p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-8 pt-2">
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.retakePhotos}
          </button>
          <button
            onClick={onNext}
            disabled={!selectedPhoto}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {t.continueToThemes}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Full-screen viewer */}
      {viewIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setViewIndex(null)}
        >
          <img
            src={capturedPhotos[viewIndex]}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
          />
          <p className="absolute bottom-8 text-white/60 text-sm">{t.clickToClose}</p>
        </div>
      )}
    </div>
  );
};
