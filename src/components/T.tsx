import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Translatable text component.
 * Wrap any user-visible text: <T>Bonjour</T>
 * The text will be auto-translated when language changes.
 */
const T = ({ children }: { children: string }) => {
  const { translate, registerText, language } = useLanguage();

  useEffect(() => {
    if (language !== "fr" && children) {
      registerText(children);
    }
  }, [children, language, registerText]);

  return <>{translate(children)}</>;
};

export default T;
