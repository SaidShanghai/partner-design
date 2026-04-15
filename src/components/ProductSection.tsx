import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import T from "@/components/T";

const imageModules = import.meta.glob("@/assets/*.jpg", { eager: true, import: "default" }) as Record<string, string>;

function resolveImage(imageUrl: string | null): string {
  if (!imageUrl) return "/placeholder.svg";
  if (imageUrl.startsWith("http")) return imageUrl;
  const match = Object.entries(imageModules).find(([path]) => imageUrl.includes(path.split("/assets/")[1] || "___"));
  return match ? match[1] : "/placeholder.svg";
}

const ProductSection = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, sell_price, image_url, category, badge_nouveaute, badge_oekotex, badge_gots, badge_bio, badge_promo, badge_exclusivite, badge_stock_limite")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        <T>Tissus et mercerie : découvrez nos nouveautés</T>
      </h2>

      <div className="flex items-center gap-6 mb-8 mt-8">
        <h3 className="font-logo text-3xl md:text-4xl text-foreground whitespace-nowrap">
          <T>Nos dernières pépites tissus</T>
        </h3>
        <a
          href="/nouveautes"
          className="text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <T>Explorez nos nouveaux tissus</T> ✨ 😍 <span className="text-xs">↗</span>
        </a>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-accent/30 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
    </section>
  );
};

export default ProductSection;
