import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { themes, getThemeCategories } from '@/lib/themes';
import { Theme } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { CyberThemeCard, CyberCategoryPill, CyberButton, CyberGlassCard, CyberGridBackground } from './CyberComponents';

interface ThemeSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const ThemeSelection: React.FC<ThemeSelectionProps> = ({ onNext, onBack }) => {
  const { selectedTheme, selectTheme } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useLanguage();

  const categories = useMemo(() => getThemeCategories(), []);

  const filteredThemes = useMemo(() => {
    if (selectedCategory === 'all') return themes;
    return themes.filter(theme => theme.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSelect = (theme: Theme) => {
    if (theme.disabled) return;
    selectTheme(theme);
  };

  return (
    <div className="min-h-screen cyber-theme">
      {/* Cyberpunk background */}
      <CyberGridBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-950/90 to-transparent backdrop-blur-xl pb-4">
          <div className="px-5 pt-8 pb-4">
            {/* Glitch title */}
            <h1 className="text-3xl font-bold text-white mb-2 relative">
              <span className="relative z-10">{t.chooseTheme}</span>
              <span className="absolute inset-0 text-cyan-400/50 blur-[1px] translate-x-[-1px]">{t.chooseTheme}</span>
              <span className="absolute inset-0 text-pink-400/50 blur-[1px] translate-x-[1px]">{t.chooseTheme}</span>
            </h1>
            <p className="text-gray-400 text-sm">{t.selectTheme}</p>
          </div>

          {/* Category pills - horizontal scroll */}
          <div className="flex gap-2 px-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <CyberCategoryPill
              label={t.allThemes}
              isActive={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            />
            {categories.map((category) => (
              <CyberCategoryPill
                key={category}
                label={t[category as keyof typeof t] || category}
                isActive={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        </div>

        {/* Theme grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-40">
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {filteredThemes.map((theme, index) => {
              const isSelected = selectedTheme?.id === theme.id;
              const isDisabled = theme.disabled;

              return (
                <div
                  key={theme.id}
                  className={`
                    transition-all duration-500
                    ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  <CyberThemeCard
                    id={theme.id}
                    name={theme.name}
                    nameZh={t[theme.name as keyof typeof t] || theme.name}
                    previewImage={theme.themeImage || '/themes/default.jpg'}
                    description={theme.description}
                    category={theme.category || 'other'}
                    isSelected={isSelected}
                    onSelect={() => handleSelect(theme)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent pt-8 pb-6 px-5">
          {/* Decorative line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="max-w-lg mx-auto flex gap-3">
            <CyberButton variant="secondary" size="md" onClick={onBack} className="flex-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.backToPhotos}
            </CyberButton>
            <CyberButton
              variant="primary"
              size="md"
              onClick={onNext}
              disabled={!selectedTheme}
              className="flex-[1.5]"
            >
              {t.generateAIPhoto}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </CyberButton>
          </div>

          {!selectedTheme && (
            <p className="text-center text-gray-500 text-xs mt-3">{t.selectThemeToContinue}</p>
          )}
        </div>
      </div>
    </div>
  );
};
