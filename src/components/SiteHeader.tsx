import { Search, User, Heart, ShoppingBag, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import sangleImg from "@/assets/mercerie-sangle.jpg";
import fermeturesImg from "@/assets/mercerie-fermetures.jpg";

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

const mercerieButtons = [
  "Fils à coudre",
  "Fermetures éclair & zips",
  "Ciseaux et outils de coupe",
];

const mercerieColumns = [
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
                <div className="fixed left-0 right-0 top-auto w-full bg-background border-t border-border shadow-xl z-50">
                  <div className="container mx-auto px-6 py-8 flex gap-6">
                    {/* Left column: Voir tout + buttons */}
                    <div className="flex flex-col gap-3 shrink-0 w-[180px]">
                      <a href="#" className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors mb-2">
                        Voir tout <ArrowUpRight className="w-4 h-4" />
                      </a>
                      {mercerieButtons.map((btn) => (
                        <a
                          key={btn}
                          href="#"
                          className="block px-4 py-2.5 text-sm bg-accent/60 text-foreground rounded-lg hover:bg-accent transition-colors"
                        >
                          {btn}
                        </a>
                      ))}
                    </div>

                    {/* Middle columns */}
                    <div className="grid grid-cols-4 gap-6 flex-1 min-w-0">
                      {mercerieColumns.map((col) => (
                        <div key={col.title}>
                          <span className="block text-sm font-bold text-foreground mb-3">
                            {col.title}
                          </span>
                          <ul className="space-y-1.5">
                            {col.items.map((item) => (
                              <li key={item}>
                                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Right images */}
                    <div className="flex gap-3 shrink-0 w-[280px] h-[280px]">
                      <div className="relative rounded-lg overflow-hidden flex-1">
                        <img src={sangleImg} alt="Sangle" className="w-full h-full object-cover" loading="lazy" />
                        <span className="absolute bottom-3 left-3 bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full">Sangle</span>
                      </div>
                      <div className="relative rounded-lg overflow-hidden flex-1">
                        <img src={fermeturesImg} alt="Fermetures au mètre" className="w-full h-full object-cover" loading="lazy" />
                        <span className="absolute bottom-3 left-3 bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full">Fermetures au mètre</span>
                      </div>
                    </div>
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
