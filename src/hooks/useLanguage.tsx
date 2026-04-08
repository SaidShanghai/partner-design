import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Language = "fr" | "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => string;
  registerText: (text: string) => void;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "fr",
  setLanguage: () => {},
  translate: (t) => t,
  registerText: () => {},
  isTranslating: false,
});

export const useLanguage = () => useContext(LanguageContext);

// Cache: lang -> { originalText -> translatedText }
const translationCache: Record<string, Record<string, string>> = {};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("fr");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const pendingTexts = useRef<Set<string>>(new Set());
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushBatch = useCallback(async (lang: Language) => {
    const texts = Array.from(pendingTexts.current);
    pendingTexts.current.clear();

    if (texts.length === 0 || lang === "fr") return;

    // Filter out already cached
    const cacheKey = lang;
    if (!translationCache[cacheKey]) translationCache[cacheKey] = {};
    const uncached = texts.filter((t) => !translationCache[cacheKey][t]);

    if (uncached.length === 0) {
      // All cached, just update state
      const merged: Record<string, string> = {};
      for (const t of texts) {
        merged[t] = translationCache[cacheKey][t] || t;
      }
      setTranslations((prev) => ({ ...prev, ...merged }));
      return;
    }

    setIsTranslating(true);

    try {
      // Batch in chunks of 30
      for (let i = 0; i < uncached.length; i += 30) {
        const chunk = uncached.slice(i, i + 30);
        const { data, error } = await supabase.functions.invoke("translate", {
          body: { texts: chunk, targetLang: lang },
        });

        if (error) {
          console.error("Translation error:", error);
          continue;
        }

        const results = data?.translations as string[] | undefined;
        if (results) {
          const merged: Record<string, string> = {};
          chunk.forEach((original, idx) => {
            const translated = results[idx] || original;
            translationCache[cacheKey][original] = translated;
            merged[original] = translated;
          });
          setTranslations((prev) => ({ ...prev, ...merged }));
        }
      }
    } catch (e) {
      console.error("Translation failed:", e);
    }

    setIsTranslating(false);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (lang === "fr") {
      setTranslations({});
      return;
    }

    // Load from cache
    const cached = translationCache[lang] || {};
    setTranslations({ ...cached });

    // Clear pending so components re-register on the next render cycle
    pendingTexts.current.clear();
    if (batchTimer.current) clearTimeout(batchTimer.current);

    // Schedule a flush after components have re-registered
    batchTimer.current = setTimeout(() => {
      flushBatch(lang);
    }, 250);
  }, [flushBatch]);

  const registerText = useCallback((text: string) => {
    if (language === "fr") return;
    if (translationCache[language]?.[text]) {
      setTranslations((prev) => {
        if (prev[text]) return prev;
        return { ...prev, [text]: translationCache[language][text] };
      });
      return;
    }

    pendingTexts.current.add(text);

    if (batchTimer.current) clearTimeout(batchTimer.current);
    batchTimer.current = setTimeout(() => {
      flushBatch(language);
    }, 100);
  }, [language, flushBatch]);

  const translate = useCallback((text: string) => {
    if (language === "fr") return text;
    return translations[text] || text;
  }, [language, translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate, registerText, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};
