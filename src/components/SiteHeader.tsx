import { Search, User, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";

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

const mercerieMenu = [
  {
    title: "Voir tout",
    items: [],
  },
  {
    title: "Fils à coudre",
    items: [],
  },
  {
    title: "Fermetures éclair & zips",
    items: [],
  },
  {
    title: "Ciseaux et outils de coupe",
    items: [],
  },
  {
    title: "Essentiels",
    items: [
      "Fils à coudre",
      "Écussons & étiquettes",
      "Mousquetons",
      "Fermetures & zip",
      "Scratch (Velcro)",
      "Boutons pression et œillets",
      "Boutons à coudre",
      "Passant et boucles",
    ],
  },
  {
    title: "Accessoires de couture",
    items: [
      "Aiguilles, épingles, pinces",
      "Boîte à couture",
      "Ciseaux, cutters",
      "Craies, crayons, stylos",
      "Dé à coudre & découd-vite",
      "Meubles de couture",
      "Outils de mesure",
    ],
  },
  {
    title: "Customisation et entretien",
    items: [
      "Colle textile",
      "Fer à repasser",
      "Loisirs créatifs",
      "Renforts & coudières",
      "Teinture tissu",
      "Transfert textile",
    ],
  },
  {
    title: "Rubans, biais et passepoils",
    items: [
      "Biais couture",
      "Appareils à biais",
      "Passepoils",
      "Élastiques",
      "Sangle",
      "Rubans et galons",
      "Galons pompons",
      "Cordon",
      "Ruban broderie anglaise et dentelle",
      "Sangle",
    ],
  },
];

const SiteHeader = () => {
  const [showMercerie, setShowMercerie] = useState(false);

  return (
    <header className="bg-background relative z-50">
      {/* Top bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Logo */}
        <a href="/" className="font-logo text-4xl md:text-5xl text-foreground tracking-wide">
          textile partner
        </a>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center border border-border rounded-full px-4 py-2 gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher"
              className="bg-transparent text-sm outline-none w-32 lg:w-48 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <button className="p-2 hover:text-primary transition-colors" aria-label="Compte">
            <User className="w-5 h-5" />
          </button>
          <button className="p-2 hover:text-primary transition-colors" aria-label="Favoris">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 hover:text-primary transition-colors" aria-label="Panier">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category bar */}
      <nav className="border-t border-border overflow-x-auto relative">
        <div className="container mx-auto px-4 flex items-center justify-center gap-1">
          {categories.map((cat) => (
            <div
              key={cat}
              className="relative"
              onMouseEnter={() => cat === "MERCERIE" && setShowMercerie(true)}
              onMouseLeave={() => cat === "MERCERIE" && setShowMercerie(false)}
            >
              <a
                href="#"
                className={`block px-3 py-3 text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${
                  cat === "MERCERIE" && showMercerie
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {cat}
              </a>

              {/* Mega menu for MERCERIE */}
              {cat === "MERCERIE" && showMercerie && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[900px] bg-background border border-border shadow-xl rounded-b-lg z-50 p-6">
                  <div className="grid grid-cols-4 gap-6">
                    {mercerieMenu.map((col) => (
                      <div key={col.title}>
                        <a
                          href="#"
                          className="block text-sm font-bold text-foreground hover:text-primary transition-colors mb-2"
                        >
                          {col.title}
                        </a>
                        {col.items.length > 0 && (
                          <ul className="space-y-1.5">
                            {col.items.map((item) => (
                              <li key={item}>
                                <a
                                  href="#"
                                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <a
            href="#"
            className="px-3 py-3 text-xs font-semibold tracking-wider text-primary whitespace-nowrap"
          >
            COUPONS À -20%
          </a>
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
