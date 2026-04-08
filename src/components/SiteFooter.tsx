import { MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import T from "@/components/T";

const flags: { lang: Language; emoji: string; label: string }[] = [
  { lang: "fr", emoji: "🇫🇷", label: "Français" },
  { lang: "en", emoji: "🇬🇧", label: "English" },
  { lang: "zh", emoji: "🇨🇳", label: "中文" },
];

const SiteFooter = () => {
  const { language, setLanguage, isTranslating } = useLanguage();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-logo text-3xl mb-4">textile partner</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              <T>Votre partenaire textile pour tous vos projets couture et décoration.</T>
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4"><T>Nos catégories</T></h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Tissu Ameublement</T></a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Tissu Habillement</T></a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Tissus Enfants</T></a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Mercerie</T></a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Patrons de Couture</T></a></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4"><T>Informations</T></h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Qui sommes-nous ?</T></a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Livraison & Retours</T></a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">CGV</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Mentions légales</T></a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity"><T>Blog Couture</T></a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>France</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>01 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>contact@textilepartner.fr</span>
              </li>
              <li className="flex items-center gap-3 mt-2">
                {isTranslating && <Loader2 className="w-4 h-4 animate-spin opacity-70" />}
                {flags.map((f) => (
                  <button
                    key={f.lang}
                    onClick={() => setLanguage(f.lang)}
                    className={`text-xl cursor-pointer transition-transform hover:scale-125 ${language === f.lang ? "scale-125 ring-2 ring-background/50 rounded-sm" : "opacity-60 hover:opacity-100"}`}
                    title={f.label}
                    aria-label={f.label}
                  >
                    {f.emoji}
                  </button>
                ))}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-10 pt-6 text-center text-xs opacity-50">
          © 2026 Textile Partner. <T>Tous droits réservés.</T>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
