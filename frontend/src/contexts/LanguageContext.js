import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../translations/en';
import hiTranslations from '../translations/hi';
import guTranslations from '../translations/gu';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get language from localStorage or default to 'en'
  const getInitialLanguage = () => {
    // First check localStorage for saved theme
    const savedTheme = localStorage.getItem('agriTheme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.language) return parsed.language;
      } catch (e) {
        console.error('Error parsing saved theme:', e);
      }
    }
    // Check data-lang attribute
    const dataLang = document.documentElement.getAttribute('data-lang');
    if (dataLang) return dataLang;
    return 'en';
  };

  const [language, setLanguage] = useState(getInitialLanguage());

  const translations = {
    en: enTranslations,
    hi: hiTranslations,
    gu: guTranslations,
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    // Update localStorage
    const savedTheme = localStorage.getItem('agriTheme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        parsed.language = newLang;
        localStorage.setItem('agriTheme', JSON.stringify(parsed));
      } catch (e) {
        console.error('Error updating theme in localStorage:', e);
      }
    } else {
      localStorage.setItem('agriTheme', JSON.stringify({ language: newLang }));
    }
    // Update data-lang attribute
    document.documentElement.setAttribute('data-lang', newLang);
  };

  // Listen for language changes from Settings component
  useEffect(() => {
    const handleLanguageChange = () => {
      const dataLang = document.documentElement.getAttribute('data-lang');
      if (dataLang && dataLang !== language) {
        setLanguage(dataLang);
      }
    };

    // Check periodically for language changes
    const interval = setInterval(handleLanguageChange, 500);
    
    // Also listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'agriTheme') {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.language && parsed.language !== language) {
            setLanguage(parsed.language);
          }
        } catch (err) {
          console.error('Error parsing storage change:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);

  // Initialize language on mount
  useEffect(() => {
    const initialLang = getInitialLanguage();
    if (initialLang !== language) {
      setLanguage(initialLang);
      document.documentElement.setAttribute('data-lang', initialLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    language,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

