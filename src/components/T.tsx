import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

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
