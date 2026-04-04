import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { themes, getThemeCategories } from '@/lib/themes';
import { Theme } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ThemeSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const ThemeSelection: React.FC<ThemeSelectionProps> = ({ onNext, onBack }) => {
  const { selectedTheme, selectTheme } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { t } = useLanguage();

  const categories = useMemo(() => getThemeCategories(), []);

  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return themes;
    return themes.filter(theme => theme.category === selectedCategory);
  }, [selectedCategory]);

  const handleSelect = (theme: Theme) => {
    if (theme.disabled) return;
    selectTheme(theme);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header - sticky */}
      <div className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-border-subtle">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-white">{t.chooseTheme}</h1>
          <p className="text-text-secondary text-sm mt-1">{t.selectTheme}</p>
        </div>

        {/* Category pills - horizontal scroll */}
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-pill ${selectedCategory === 'all' ? 'category-pill-active' : 'category-pill-inactive'}`}
          >
            {t.allThemes}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-pill ${selectedCategory === category ? 'category-pill-active' : 'category-pill-inactive'}`}
            >
              {t[category as keyof typeof t] || category}
            </button>
          ))}
        </div>
      </div>

      {/* Theme grid - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {filteredThemes.map((theme) => {
            const isSelected = selectedTheme?.id === theme.id;
            const isDisabled = theme.disabled;

            return (
              <div
                key={theme.id}
                onClick={() => handleSelect(theme)}
                className={`theme-card ${isSelected ? 'theme-card-selected' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Image */}
                <div className="aspect-[3/4] bg-surface-light relative">
                  {theme.disabled && theme.id === 'custom-coming-soon' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-400/20 to-accent-500/20">
                      <svg className="w-10 h-10 text-text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span className="text-text-muted text-xs font-medium">{t.customTheme}</span>
                    </div>
                  ) : theme.themeImage ? (
                    <img src={theme.themeImage} alt={theme.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Coming soon badge */}
                  {isDisabled && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-medium px-2 py-1 rounded-lg">
                      {t.comingSoon}
                    </div>
                  )}

                  {/* Selection check */}
                  {isSelected && !isDisabled && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {t[theme.name as keyof typeof t] || theme.name}
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                    {theme.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom action bar - sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-border-subtle">
        <div className="max-w-lg mx-auto px-5 py-4 flex gap-3">
          <button onClick={onBack} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.backToPhotos}
          </button>
          <button
            onClick={onNext}
            disabled={!selectedTheme}
            className="btn-primary flex-[1.5] flex items-center justify-center gap-2 text-sm"
          >
            {t.generateAIPhoto}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
        {!selectedTheme && (
          <p className="text-center text-text-muted text-xs pb-2">{t.selectThemeToContinue}</p>
        )}
      </div>
    </div>
  );
};
