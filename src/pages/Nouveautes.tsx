import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import T from "@/components/T";

const imageModules = import.meta.glob("@/assets/*.jpg", { eager: true, import: "default" }) as Record<string, string>;

function resolveImage(imageUrl: string | null): string {
  if (!imageUrl) return "/placeholder.svg";
  if (imageUrl.startsWith("http")) return imageUrl;
  const match = Object.entries(imageModules).find(([path]) => imageUrl.includes(path.split("/assets/")[1] || "___"));
  return match ? match[1] : "/placeholder.svg";
}

const filters = ["COULEUR", "MOTIF", "FABRICANTS", "PLUS DE FILTRES"];

const Nouveautes = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-nouveautes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, sell_price, image_url, category, badge_nouveaute, badge_oekotex, badge_gots, badge_bio, badge_promo, badge_exclusivite, badge_stock_limite")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors"><T>Accueil</T></Link>
        </nav>

        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight uppercase mb-4">
            <T>Nouveautés Tissus et Mercerie</T>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <T>Découvrez les nouveautés Textile Partner : une sélection de tissus tendance, mercerie créative et accessoires couture pour vos projets du moment.</T>
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
              <option>Nouveaux produits en premier</option>
              <option>Prix croissant</option>
              <option>Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square bg-accent/30 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
            {(products || []).map((product) => {
              const badgeLabels: string[] = [];
              if (product.badge_nouveaute) badgeLabels.push("Nouveauté");
              if (product.badge_oekotex) badgeLabels.push("Oeko-Tex");
              if (product.badge_gots) badgeLabels.push("GOTS");
              if (product.badge_bio) badgeLabels.push("Bio");
              if (product.badge_promo) badgeLabels.push("Promo");
              if (product.badge_exclusivite) badgeLabels.push("Exclusivité");
              if (product.badge_stock_limite) badgeLabels.push("Stock limité");
              const displayPrice = product.sell_price ?? product.price ?? 0;
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  image={resolveImage(product.image_url)}
                  name={product.name}
                  price={`${displayPrice.toFixed(2).replace(".", ",")} €`}
                  numericPrice={displayPrice}
                  unit="le mètre"
                  badge={badgeLabels.join(", ")}
                />
              );
            })}
          </div>
        )}

        {/* SEO block */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-accent/30 rounded-xl p-8">
            <h2 className="text-lg font-bold text-foreground mb-4 font-serif italic">
              <T>Nos Dernières Nouveautés Tissus et Mercerie</T>
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                <T>Retrouvez chaque semaine de nouveaux tissus et accessoires de mercerie soigneusement sélectionnés pour vous.</T>
              </p>
              <p>
                <T>Que vous cherchiez un tissu pour une robe d'été, un projet de couture pour enfant ou des fournitures de mercerie créative, nos nouveautés vous offrent un large choix.</T>
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
