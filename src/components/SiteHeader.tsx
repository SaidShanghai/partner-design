import { Search, User, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import MegaMenu, { type MegaMenuData } from "./MegaMenu";
import sangleImg from "@/assets/mercerie-sangle.jpg";
import fermeturesImg from "@/assets/mercerie-fermetures.jpg";
import tissuCotonImg from "@/assets/tissu-coton.jpg";
import tissuVeloursImg from "@/assets/tissu-velours.jpg";
import tissuNouvelleImg from "@/assets/tissu-nouvelle-collection.jpg";
import tissuEnfantsImg from "@/assets/tissu-enfants-collection.jpg";
import tissuSweatImg from "@/assets/tissu-enfants-sweat.jpg";
import tissuLibertyImg from "@/assets/tissu-liberty.jpg";
import tissuVichyImg from "@/assets/tissu-vichy.jpg";
import tissuMatelasseImg from "@/assets/tissu-matelasse.jpg";
import tissuSergeImg from "@/assets/tissu-serge-coton.jpg";
import patronsBurdaImg from "@/assets/patrons-burda.jpg";
import patronsFauveImg from "@/assets/patrons-maison-fauve.jpg";
import tricotAmigurumiImg from "@/assets/tricot-amigurumi.jpg";

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
  "TISSUS ENFANTS": {
    columns: [
      {
        title: "Patrons enfant - bébé",
        items: ["Patron Bébé", "Patron de couture enfant", "Patron Accessoires bébé", "Patron Robe fille", "Patron Vêtement garçon", "Patron de couture ado"],
      },
      {
        title: "Type Tissu",
        items: ["Jersey imprimé", "Velours milleraies", "Double gaze", "Sweat Molleton", "Bord-côte", "PUL", "Tissu doudou", "Flanelle et pilou", "Tissu matelassé", "Tissu minky", "Tissu velours Nicki", "Tissus Bio"],
      },
      {
        title: "Imprimés",
        items: ["Tissu Disney© Marvel", "Tissu Harry Potter au mètre", "Voir tous les imprimés"],
      },
      {
        title: "Spectacles et déguisements",
        items: ["Fausse fourrure déguisement", "Tissu lamé", "Tulle"],
      },
    ],
    images: [
      { src: tissuEnfantsImg, alt: "Collection Enfants", label: "Collection Enfants" },
      { src: tissuSweatImg, alt: "Sweat", label: "Sweat" },
    ],
  },
  "IMPRIMÉS": {
    columns: [
      {
        title: "Intemporels",
        items: ["Tissu à carreaux", "Tissu fleuri", "Tissu leopard et panthere", "Tissu à pois", "Tissus à rayures", "Tissus vichy"],
      },
      {
        title: "Motifs",
        items: ["Tissu animal", "Tissu camouflage", "Tissu coeur", "Tissu étoile", "Tissu fruits légumes", "Tissu halloween", "Tissu marin", "Tissu Noël", "Tissu pied de poule"],
      },
      {
        title: "Tissus par style",
        items: ["Tissu africain", "Tissu ethnique", "Tissu indien", "Tissus japonais"],
      },
      {
        title: "Teinte",
        items: ["Tissu argenté", "Tissu or", "Tissu multicolore"],
      },
      {
        title: "Tissus par couleur",
        items: ["Tissu blanc", "Tissu écru", "Tissu jaune", "Tissu orange", "Tissu rose", "Tissu corail", "Tissu rouge", "Tissu violet", "Tissu bleu", "Tissu vert", "Tissu marron", "Tissu gris", "Tissu noir"],
      },
    ],
    images: [
      { src: tissuLibertyImg, alt: "Liberty Fabrics", label: "Liberty Fabrics" },
      { src: tissuVichyImg, alt: "Tissu vichy", label: "Tissu vichy" },
    ],
  },
  "SACS": {
    columns: [
      {
        title: "Simili cuir pour sac",
        items: ["Simili cuir uni", "Simili cuir fantaisie", "Simili cuir épais", "Tissu liège", "Cretonne coton", "Effet lin", "Carrés jacquards et panneaux coussin", "Tissus couture zero déchet"],
      },
      {
        title: "Sangles pour sac",
        items: [],
      },
      {
        title: "Attaches et fermoir",
        items: ["Passant et boucles", "Mousquetons", "Arrêts cordons", "Fermoirs", "Fermoirs premium", "Fond de sac", "Oeillets"],
      },
      {
        title: "Anses et chaînes",
        items: ["Anses de sacs", "Bandoulières de sac"],
      },
      {
        title: "Patrons couture sac",
        items: ["Patron sac Burda"],
      },
      {
        title: "Entoilage / thermocollant",
        items: ["Molleton & Ouate", "Mousse Résille", "Vlieseline / thermocollant"],
      },
    ],
    images: [
      { src: tissuMatelasseImg, alt: "Tissu matelassé", label: "Tissu matelassé" },
      { src: tissuSergeImg, alt: "Sergé de coton", label: "Sergé de coton" },
    ],
  },
  "PATRONS DE COUTURE": {
    columns: [
      {
        title: "Créateurs",
        items: ["Atelier Scammit", "Les BG", "Burda", "Clematisse Pattern", "Fibre mood", "Ikatee", "Laboratoire Familial", "Les Enchantées", "Marmai", "Maeli paris", "Maison Fauve", "Majam", "PM Patterns"],
      },
      {
        title: "Je veux coudre",
        items: ["Blouse & top", "Jupe", "Robe", "Manteau / Cape", "Combinaison", "Pantalon / Short", "Pull / Gilet", "Veste", "Lingerie / Pyjama / Maillot"],
      },
      {
        title: "Patrons de couture",
        items: ["Accessoires bébé", "Bébé", "Enfant", "Femme", "Grandes Tailles", "Homme", "Sacs", "Déguisement"],
      },
      {
        title: "Livres, Magazines",
        items: ["Kit couture", "Livres Couture", "Livres Crochet", "Livres Tricot"],
      },
    ],
    images: [
      { src: patronsBurdaImg, alt: "Patrons Burda", label: "Patrons Burda" },
      { src: patronsFauveImg, alt: "Patrons Maison Fauve", label: "Patrons Maison Fauve" },
    ],
  },
  "TRICOT & CROCHET": {
    columns: [
      {
        title: "Marques",
        items: ["DMC", "Katia", "Rico Design"],
      },
      {
        title: "Fils par matières",
        items: ["Fils Acrylique", "Fils Alpaga", "Fils Coton", "Fils Laine - Mérino", "Fils nobles - Mohair Soie Cachemire", "Fils naturels - éco-responsables", "Fil pour bébé"],
      },
      {
        title: "Fils fantaisie",
        items: ["Fils Chenilles", "Fils poilus", "Fils Fourrure", "Fils pailletés", "Fils phosphorescents"],
      },
      {
        title: "Fils par taille",
        items: ["1,25 à 2,5 mm - super fin", "3 à 4,5 mm - fin", "5 à 7 mm - moyen", "7,5 à 10 mm - épais", "12 à 20 mm - très épais"],
      },
      {
        title: "Accessoires",
        items: ["Aiguilles à tricoter", "Crochets", "Livres tricot", "Livres crochet"],
      },
      {
        title: "Activités",
        items: ["Macramé", "Amigurumi"],
      },
    ],
    images: [
      { src: tricotAmigurumiImg, alt: "Amigurimi", label: "Amigurimi" },
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
                <MegaMenu data={megaMenus[cat]} onClose={() => setActiveMenu(null)} />
              )}
            </div>
          ))}
          <a href="/coupons" className="px-3 py-3 text-xs font-semibold tracking-wider text-primary whitespace-nowrap">
            COUPONS À -20%
          </a>
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
