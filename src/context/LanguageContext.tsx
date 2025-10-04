"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "es",
  setLocale: () => {
    console.warn("setLocale called outside of a LanguageProvider");
  },
});

export const LanguageProvider = ({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: string;
}) => {
  const [locale] = useState(initialLocale);

  const setLocale = useCallback((newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
