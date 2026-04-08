import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ChevronDown, Minus, Plus } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteFooter from "@/components/SiteFooter";

import nouveaute1 from "@/assets/nouveaute-1.jpg";
import nouveaute2 from "@/assets/nouveaute-2.jpg";
import nouveaute3 from "@/assets/nouveaute-3.jpg";
import nouveaute4 from "@/assets/nouveaute-4.jpg";
import nouveaute5 from "@/assets/nouveaute-5.jpg";
import nouveaute6 from "@/assets/nouveaute-6.jpg";

const products = [
  {
    image: nouveaute1,
    name: "Tissu Coton Léger Indien Jaune Fleuri Rose",
    price: "9,95 €",
    unit: "le mètre",
  },
  {
    image: nouveaute2,
    name: "Tissu Matelassé Coton Indien Jaune Motif Fleuri Rose",
    price: "17,95 €",
    unit: "le mètre",
  },
  {
    image: nouveaute3,
    name: "Tissu Coton Léger Indien à Rayures Bleues et Roses",
    price: "9,95 €",
    unit: "le mètre",
  },
  {
    image: nouveaute4,
    name: "Tissu Coton Léger Indien Rose Bonbon Motif Floral Jaune",
    price: "9,95 €",
    unit: "le mètre",
  },
  {
    image: nouveaute5,
    name: "Tissu Matelassé Coton Indien Rose Bonbon Motif Floral Jaune",
    price: "17,95 €",
    unit: "le mètre",
  },
  {
    image: nouveaute6,
    name: "Tissu Viscose Vert Émeraude Motif Libellules Dorées",
    price: "12,50 €",
    unit: "le mètre",
  },
];

const filters = ["COULEUR", "MOTIF", "FABRICANTS", "PLUS DE FILTRES"];

const Nouveautes = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
        </nav>

        {/* Title & Description */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight uppercase mb-4">
            Nouveautés Tissus et Mercerie
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Découvrez les nouveautés Textile Partner : une sélection de{" "} : une sélection de{" "}
            <Link to="/categorie/coton" className="text-primary hover:underline">tissus tendance</Link>,
            mercerie créative et accessoires couture pour vos projets du moment.
            De nouvelles matières, couleurs et idées arrivent chaque saison pour vous inspirer vos créations !
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                className="flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors"
              >
                {filter} <ChevronDown className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Trier par :</span>
            <select className="text-xs border border-border rounded px-3 py-1.5 bg-background text-foreground">
              <option>Pertinence, ordre inverse</option>
              <option>Prix croissant</option>
              <option>Prix décroissant</option>
              <option>Nouveaux produits en premier</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
          {products.map((product, idx) => (
            <NouveauteCard key={idx} product={product} idx={idx} />
          ))}
        </div>

        {/* SEO block */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-accent/30 rounded-xl p-8">
            <h2 className="text-lg font-bold text-foreground mb-4 font-serif italic">
              Nos Dernières Nouveautés Tissus & Mercerie
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                Retrouvez chaque semaine de nouveaux tissus et accessoires de mercerie soigneusement sélectionnés pour vous. 
                Cotons imprimés, viscoses fluides, matelassés originaux… notre catalogue s'enrichit au fil des saisons.
              </p>
              <p>
                Que vous cherchiez un tissu pour une robe d'été, un projet de couture pour enfant ou des fournitures de mercerie créative, 
                nos nouveautés vous offrent un large choix de matières, couleurs et motifs tendance.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Nouveautes;
