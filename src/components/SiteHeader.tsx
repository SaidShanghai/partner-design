import { Search, User, Heart, ShoppingBag } from "lucide-react";

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

const SiteHeader = () => {
  return (
    <header className="bg-background">
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
      <nav className="border-t border-border overflow-x-auto">
        <div className="container mx-auto px-4 flex items-center justify-center gap-1">
          {categories.map((cat) => (
            <a
              key={cat}
              href="#"
              className="px-3 py-3 text-xs font-semibold tracking-wider text-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              {cat}
            </a>
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
