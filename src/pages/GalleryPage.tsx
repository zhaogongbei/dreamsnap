import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGalleryPhotos, subscribeToGalleryPhotos } from '@/lib/supabase';
import { useLanguage, LanguageSwitcher } from '@/contexts/LanguageContext';

interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  date: Date;
  fullName: string;
  themeSelected: string;
}

interface GalleryPageProps {
  onStartNew: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onStartNew }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPhotoPopup, setNewPhotoPopup] = useState<GalleryPhoto | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const transformPhoto = useCallback((item: any): GalleryPhoto => ({
    id: item.id,
    url: item.image_url,
    caption: item.caption,
    date: new Date(item.created_at),
    fullName: item.full_name,
    themeSelected: item.theme_selected,
  }), []);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing gallery...');
      loadPhotos();
    }, 900000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    const reshuffleInterval = setInterval(() => {
      setShuffleKey(prev => prev + 1);
    }, 60000);

    return () => {
      clearInterval(reshuffleInterval);
    };
  }, []);

  useEffect(() => {
    const eventId = import.meta.env.VITE_EVENT_ID;
    if (!eventId) {
      console.warn('No event ID found, real-time updates disabled');
      return;
    }

    const unsubscribe = subscribeToGalleryPhotos(
      eventId,
      (newPhoto) => {
        const transformedPhoto = transformPhoto(newPhoto);
        setPhotos((prevPhotos) => {
          if (prevPhotos.some(p => p.id === transformedPhoto.id)) {
            return prevPhotos;
          }

          setNewPhotoPopup(transformedPhoto);

          setTimeout(() => {
            setNewPhotoPopup(null);
          }, 3000);

          return [transformedPhoto, ...prevPhotos];
        });
      },
      (error) => {
        console.error('Real-time subscription error:', error);
        setError('Real-time updates temporarily unavailable');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [transformPhoto]);

  const allPhotos = useMemo(() => {
    if (photos.length === 0) return [];

    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const minPhotosNeeded = 15;
    let result = shuffleArray([...photos]);
    while (result.length < minPhotosNeeded) {
      result = [...result, ...shuffleArray([...photos])];
    }
    return result;
  }, [photos, shuffleKey]);

  const loadPhotos = async () => {
    try {
      setLoading(true);

      const eventId = import.meta.env.VITE_EVENT_ID;
      const galleryData = await fetchGalleryPhotos(eventId);

      if (galleryData.length === 0) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      const transformedPhotos: GalleryPhoto[] = galleryData.map(transformPhoto);
      setPhotos(transformedPhotos);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-8 border-gray-300 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xl text-gray-800 mb-4">{t.error}</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadPhotos}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="absolute top-4 left-4 flex gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white bg-opacity-90 backdrop-blur-md text-gray-800 rounded-full shadow-lg hover:bg-opacity-100 transition-all text-sm font-medium"
          >
            {t.backToHome}
          </button>
        </div>

        <div className="text-center max-w-md">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.gallery}</h2>
          <p className="text-gray-600 mb-6">
            {t.noHistory}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {t.createFirstPhoto}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden flex items-center justify-center relative">
      <style>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          97% {
            transform: translateX(-50%);
            opacity: 1;
          }
          99% {
            transform: translateX(-50%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 0;
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes popIn {
          0% {
            transform: scale(0) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .scroll-left {
          animation: scrollLeft 60s linear infinite, fadeIn 1s ease-in;
        }
        .pop-in {
          animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Top Navigation */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <LanguageSwitcher />
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-white bg-opacity-90 backdrop-blur-md text-gray-800 rounded-full shadow-lg hover:bg-opacity-100 transition-all text-sm font-medium"
        >
          {t.backToHome}
        </button>
      </div>

      {/* Scrolling Photos */}
      <div className="overflow-hidden w-full">
        <div key={shuffleKey} className="flex gap-4 scroll-left">
          {[...allPhotos, ...allPhotos].map((photo, index) => (
            <div
              key={`${photo.id}-${index}`}
              className="flex-shrink-0 h-[80vh] w-auto aspect-[9/16] overflow-hidden rounded-lg"
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* New Photo Popup */}
      {newPhotoPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 pointer-events-none">
          <div className="pop-in max-w-md w-full px-4">
            <div className="relative aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={newPhotoPopup.url}
                alt="New photo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
