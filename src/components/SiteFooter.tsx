import { MapPin, Phone, Mail } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-logo text-3xl mb-4">textile partner</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Votre partenaire textile pour tous vos projets couture et décoration.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Nos catégories</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Tissu Ameublement</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Tissu Habillement</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Tissus Enfants</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Mercerie</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Patrons de Couture</a></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Informations</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Qui sommes-nous ?</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Livraison & Retours</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">CGV</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Mentions légales</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Blog Couture</a></li>
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
                <span className="text-lg" title="Français">🇫🇷</span>
                <span className="text-lg" title="English">🇬🇧</span>
                <span className="text-lg" title="中文">🇨🇳</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-10 pt-6 text-center text-xs opacity-50">
          © 2026 Textile Partner. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
