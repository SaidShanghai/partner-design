import { Search, User, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import MegaMenu, { type MegaMenuData } from "./MegaMenu";
import sangleImg from "@/assets/mercerie-sangle.jpg";
import fermeturesImg from "@/assets/mercerie-fermetures.jpg";
import tissuCotonImg from "@/assets/tissu-coton.jpg";
import tissuVeloursImg from "@/assets/tissu-velours.jpg";
import tissuNouvelleImg from "@/assets/tissu-nouvelle-collection.jpg";

const navLinks = [
  "Nos magasins",
  "Blog",
  "Carte Cadeau",
  "Nous contacter",
];

const categories = [
  "NOUVEAU",
  "MERCERIE",
  "TISSU AMEUBLEMENT",
  "TISSU HABILLEMENT",
  "TISSUS ENFANTS",
  "IMPRIMÉS",
  "SACS",
  "PATRONS DE COUTURE",
  "TRICOT & CROCHET",
];

const megaMenus: Record<string, MegaMenuData> = {
  MERCERIE: {
    buttons: [
      { label: "Fils à coudre" },
      { label: "Fermetures éclair & zips" },
      { label: "Ciseaux et outils de coupe" },
    ],
    columns: [
      {
        title: "Essentiels",
        items: ["Fils à coudre", "Écussons & étiquettes", "Mousquetons", "Fermetures & zip", "Scratch (Velcro)", "Boutons pression et œillets", "Boutons à coudre", "Passant et boucles"],
      },
      {
        title: "Accessoires de couture",
        items: ["Aiguilles, épingles, pinces", "Boîte à couture", "Ciseaux, cutters", "Craies, crayons, stylos", "Dé à coudre & découd-vite", "Meubles de couture", "Outils de mesure"],
      },
      {
        title: "Customisation et entretien",
        items: ["Colle textile", "Fer à repasser", "Loisirs créatifs", "Renforts & coudières", "Teinture tissu", "Transfert textile"],
      },
      {
        title: "Rubans, biais et passepoils",
        items: ["Biais couture", "Appareils à biais", "Passepoils", "Élastiques", "Sangle", "Rubans et galons", "Galons pompons", "Cordon", "Ruban broderie anglaise et dentelle"],
      },
    ],
    images: [
      { src: sangleImg, alt: "Sangle", label: "Sangle" },
      { src: fermeturesImg, alt: "Fermetures au mètre", label: "Fermetures au mètre" },
    ],
  },
  "TISSU AMEUBLEMENT": {
    columns: [
      {
        title: "Par projet",
        items: ["Tissu pour fauteuil", "Tissu pour canapé", "Tissus pour Rideaux - coussins", "Tissus tapissiers", "Tissu nappe", "Tissu Extérieur"],
      },
      {
        title: "Par type de tissu",
        items: ["Burlington", "Bouclette", "Coton Imprimé", "Coton uni épais", "Effet Lin", "Enduit", "Éponge", "Jacquard", "Lin ameublement", "Simili cuir", "Suédine", "Toile de jouy", "Toile de jute", "Tapissiers", "Velours ameublement"],
      },
      {
        title: "Par Caractéristique",
        items: ["Tissu ignifugé", "Tissu isolant", "Tissu grande largeur"],
      },
      {
        title: "Tissu Extérieur",
        items: ["Tissu imperméable et déperlant", "Toile de transat", "Tissu moustiquaire"],
      },
    ],
    images: [
      { src: tissuCotonImg, alt: "Toile de coton", label: "Toile de coton" },
      { src: tissuVeloursImg, alt: "Tissu velours côtelés", label: "Tissu velours côtelés" },
    ],
  },
  "TISSU HABILLEMENT": {
    buttons: [
      { label: "Nouvelle collection 2026" },
      { label: "Tissus Unis Essentiels" },
      { label: "Tissus fêtes & cérémonies" },
      { label: "Matelassé" },
      { label: "Viscose" },
    ],
    columns: [
      {
        title: "Par tissu A-I",
        items: ["Broderie anglaise", "Bord-côte", "Bouclette", "Draps de laine", "Chambray", "Coton", "Crepe", "Tissu crochet", "Double gaze", "Dentelles", "Écossais, Tartan Prince de galles", "Fausse fourrure", "Gabardine", "Imperméables et parka"],
      },
      {
        title: "J-S",
        items: ["Jacquards habillement", "Jean et denim", "Jersey", "Maille polo", "Lainage et maille", "Lin", "Lycra et Maillot de bain", "Lyocell", "Tissu manteau", "Microfibre et Polyester", "Polaire", "Popeline de coton", "Plumetis", "Satin", "Sequins, paillettes et fête", "Sergé et twill"],
      },
      {
        title: "S-W",
        items: ["Scuba et Milano", "Seersucker", "Sherpa mouton", "Soie", "Simili cuir Habillement", "Softshell", "Suédine habillement", "Sweat Molleton", "Taffetas", "Tweed", "Tulle et résille", "Viscose", "Velours vesti", "Voile, mousseline", "Wax"],
      },
      {
        title: "Par projet",
        items: ["Tissu pour robe", "Tissus fêtes & cérémonies"],
      },
      {
        title: "Tissus créateurs",
        items: ["Katia Fabrics", "Liberty Fabrics", "Petit Pan"],
      },
      {
        title: "Tissus techniques",
        items: ["Doublure", "PUL", "Toile tailleur", "Toile a patron", "Vlieseline / thermocollant"],
      },
    ],
    images: [
      { src: tissuNouvelleImg, alt: "Nouvelle collection", label: "Nouvelle collection" },
    ],
  },
};

const SiteHeader = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <header className="bg-background relative z-50">
      {/* Top bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link} href="#" className="text-sm text-foreground hover:text-primary transition-colors">
              {link}
            </a>
          ))}
        </nav>

        <a href="/" className="font-logo text-4xl md:text-5xl text-foreground tracking-wide">
          textile partner
        </a>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center border border-border rounded-full px-4 py-2 gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Rechercher" className="bg-transparent text-sm outline-none w-32 lg:w-48 text-foreground placeholder:text-muted-foreground" />
          </div>
          <button className="p-2 hover:text-primary transition-colors" aria-label="Compte"><User className="w-5 h-5" /></button>
          <button className="p-2 hover:text-primary transition-colors" aria-label="Favoris"><Heart className="w-5 h-5" /></button>
          <button className="p-2 hover:text-primary transition-colors" aria-label="Panier"><ShoppingBag className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Category bar */}
      <nav className="border-t border-border overflow-x-auto relative">
        <div className="container mx-auto px-4 flex items-center justify-center gap-1">
          {categories.map((cat) => (
            <div
              key={cat}
              className="relative"
              onMouseEnter={() => megaMenus[cat] && setActiveMenu(cat)}
              onMouseLeave={() => megaMenus[cat] && setActiveMenu(null)}
            >
              <a
                href="#"
                className={`block px-3 py-3 text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${
                  activeMenu === cat ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                {cat}
              </a>

              {activeMenu === cat && megaMenus[cat] && (
                <MegaMenu data={megaMenus[cat]} />
              )}
            </div>
          ))}
          <a href="#" className="px-3 py-3 text-xs font-semibold tracking-wider text-primary whitespace-nowrap">
            COUPONS À -20%
          </a>
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
