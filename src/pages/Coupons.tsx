import SiteHeader from "@/components/SiteHeader";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteFooter from "@/components/SiteFooter";
import CouponCard from "@/components/CouponCard";

import couponFloralNoir from "@/assets/coupon-floral-noir.jpg";
import couponNoel from "@/assets/coupon-noel.jpg";
import couponPoisVert from "@/assets/coupon-pois-vert.jpg";
import couponLibertyPink from "@/assets/coupon-liberty-pink.jpg";
import couponDamask from "@/assets/coupon-damask.jpg";
import couponLeopard from "@/assets/coupon-leopard.jpg";
import couponSangleNoire from "@/assets/coupon-sangle-noire.jpg";
import couponToileKaki from "@/assets/coupon-toile-kaki.jpg";
import couponRayures from "@/assets/coupon-rayures.jpg";
import couponJacquard from "@/assets/coupon-jacquard-floral.jpg";
import couponFeuillesNb from "@/assets/coupon-feuilles-nb.jpg";
import tissuVeloursImg from "@/assets/tissu-velours.jpg";

const coupons = [
  {
    image: couponFloralNoir,
    name: "Coupon - Viscose Impression Digitale Fleurs Fond Noir",
    originalPrice: "à partir de 12,50 €",
    salePrice: "9,99 €",
    discount: "-20%",
    badges: [{ label: "NOUVEAUTÉ", color: "green" as const }],
    variants: "Coupon de 0,75m",
  },
  {
    image: couponNoel,
    name: "Coupon - Tissu Multiusage Coton & Toile Décoration en Rode Motif Fleurs",
    originalPrice: "à partir de 1,80 €",
    salePrice: "0,75 €",
    discount: "-50%",
    badges: [{ label: "DÉSTOCKAGE", color: "pink" as const }],
    variants: "Existe Par Coupon de 1m",
  },
  {
    image: couponPoisVert,
    name: "Coupon - Tissu Liberty Stardust Pois Vert 7 mm",
    originalPrice: "5,25 €",
    salePrice: "4,19 €",
    discount: "-20%",
    badges: [{ label: "NOUVEAUTÉ", color: "green" as const }],
  },
  {
    image: couponDamask,
    name: "Coupon - Simili Cuir Saffiano Petit Brillant",
    originalPrice: "à partir de 5,25 €",
    salePrice: "3,99 €",
    discount: "-25%",
    badges: [{ label: "DÉSTOCKAGE", color: "pink" as const }],
    variants: "Coupon de 0,50m",
  },
  {
    image: couponLibertyPink,
    name: "Coupon - Tissu Multiusage Coton Bio Cloud Motif Petites fleurs",
    originalPrice: "à partir de 4,99 €",
    salePrice: "3,29 €",
    discount: "-35%",
    variants: "Biologique",
  },
  {
    image: couponLeopard,
    name: "Coupon - Toile de Coton Souple Nature Barège Graphique Citrus",
    originalPrice: "à partir de 3,50 €",
    salePrice: "2,49 €",
    discount: "-30%",
    variants: "Coupon de 0,75m",
  },
  {
    image: couponSangleNoire,
    name: "Coupon - Mousse Textile Thermoformable 3 mm Noir - Mesh noir",
    originalPrice: "à partir de 5,25 €",
    salePrice: "3,49 €",
    discount: "-35%",
    badges: [{ label: "DÉSTOCKAGE", color: "pink" as const }],
    variants: "Par pièce de 1 Mètre",
  },
  {
    image: couponRayures,
    name: "Coupon - Sangle en Coton Noir, Lin ou Naturel 30/1 Softie",
    originalPrice: "1 mètre de 0,99 €",
    salePrice: "0,79 €",
    discount: "-20%",
    badges: [{ label: "NOUVEAUTÉ", color: "green" as const }],
    variants: "Par pièce de 1 Mètre",
  },
  {
    image: tissuVeloursImg,
    name: "Coupon - Velours Côtelé Milleraies Mémory 350g",
    originalPrice: "à partir de 11,90 €",
    salePrice: "8,99 €",
    discount: "-25%",
    badges: [{ label: "NOUVEAUTÉ", color: "green" as const }],
    variants: "Coupon de 0,50m",
  },
  {
    image: couponJacquard,
    name: "Coupon - Tissu Fleuri Stretch Polyester Extension Émeraude",
    originalPrice: "à partir de 12,90 €",
    salePrice: "9,99 €",
    discount: "-25%",
    badges: [{ label: "DÉSTOCKAGE", color: "pink" as const }],
    variants: "Tissu Thaïlande 2,05 €",
  },
  {
    image: couponFeuillesNb,
    name: "Coupon - Tissu Toker Stretch et Ato Canossa Caramel",
    originalPrice: "Motif par rapport 9€",
    salePrice: "6,75 €",
    discount: "-25%",
    badges: [{ label: "NOUVEAUTÉ", color: "green" as const }],
    variants: "Coupon de 1,50m",
  },
  {
    image: couponToileKaki,
    name: "Coupon - Tissu Mousseline Sheer Toile et Molie Luxe à Motif étoiles",
    originalPrice: "1,75 €",
    salePrice: "1,25 €",
    discount: "-30%",
    variants: "à partir de 1 mètre",
  },
];

const filterTabs = ["COUPS PRINCIPALE", "NOUVEAUTÉS", "SUPER BONS PLAN", "PLUS DE FILTRES"];

const Coupons = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <p className="text-xs text-muted-foreground mb-6">ACCUEIL</p>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            LES COUPONS
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">
            C'est le bon plan Textile Partner ! Nos coupons de tissus : un large choix de matières,
            couleurs et motifs à prix mini pour toutes vos créations couture !
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            voir conditions coupons en FATY
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-border pb-3 overflow-x-auto">
          {filterTabs.map((tab, i) => (
            <button
              key={tab}
              className={`text-xs font-semibold tracking-wider whitespace-nowrap pb-1 transition-colors ${
                i === 0
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab} {i === 3 && "▼"}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Trier par :</span>
            <select className="text-xs bg-transparent text-foreground border border-border rounded px-2 py-1">
              <option>Nouveaux produits en premier</option>
              <option>Prix croissant</option>
              <option>Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {coupons.map((coupon, index) => (
            <CouponCard key={index} {...coupon} />
          ))}
        </div>

        {/* Banner */}
        <div className="mt-10 bg-primary text-primary-foreground rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold uppercase">
            Arrivage quotidien, coup de coeur assuré !
          </h2>
          <a href="#" className="mt-3 inline-block text-sm underline">
            ↗ Je découvre →
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Coupons;
