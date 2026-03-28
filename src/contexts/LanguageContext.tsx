import { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to get saved language from localStorage, default to browser language or 'en'
  const getInitialLanguage = (): Language => {
    try {
      const saved = localStorage.getItem('dreamsnap_language') as Language;
      if (saved && (saved === 'en' || saved === 'zh')) {
        return saved;
      }
      // Check browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('zh')) {
        return 'zh';
      }
    } catch {
      // localStorage not available
    }
    return 'en';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('dreamsnap_language', lang);
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-500 transition-all text-sm font-medium flex items-center gap-1"
      title="Switch Language / 切换语言"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      {language === 'en' ? '中文' : 'EN'}
    </button>
  );
}
