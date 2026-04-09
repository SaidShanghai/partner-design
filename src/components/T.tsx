import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Translatable text component.
 * Wrap any user-visible text: <T>Bonjour</T>
 * The text will be auto-translated when language changes.
 * Shows a subtle placeholder while waiting for translation.
 */
const T = ({ children }: { children: string }) => {
  const { translate, registerText, language } = useLanguage();

  useEffect(() => {
    if (language !== "fr" && children) {
      registerText(children);
    }
  }, [children, language, registerText]);

  const translated = translate(children);
  const isWaiting = language !== "fr" && translated === children;

  if (isWaiting) {
    return (
      <span className="inline-block bg-muted/50 rounded animate-pulse" style={{ minWidth: `${children.length * 0.5}em`, minHeight: '1em' }}>
        &nbsp;
      </span>
    );
  }

  return <>{translated}</>;
};

export default T;
