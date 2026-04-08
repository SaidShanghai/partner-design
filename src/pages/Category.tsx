import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, ChevronDown } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteFooter from "@/components/SiteFooter";
import { categoriesData } from "@/data/categories";

// Dynamic image imports
const imageModules = import.meta.glob("@/assets/cat-*.jpg", { eager: true, import: "default" }) as Record<string, string>;

function getImage(key: string): string {
  const match = Object.entries(imageModules).find(([path]) => path.includes(key));
  return match ? match[1] : "/placeholder.svg";
}

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? categoriesData[slug] : null;

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <SiteHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Catégorie introuvable</h1>
          <p className="text-muted-foreground mb-6">Cette catégorie n'existe pas encore.</p>
          <Link to="/" className="text-primary hover:underline">← Retour à l'accueil</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <span>/</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">{category.parentName}</span>
        </nav>

        {/* Title & Description */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight uppercase mb-4">
            {category.name}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {category.shortDescription}
          </p>
        </div>

        {/* Filter bar */}
        {category.filters && (
          <div className="flex items-center gap-6 mb-8 border-b border-border pb-3 overflow-x-auto">
            {category.filters.map((filter) => (
              <button
                key={filter}
                className="flex items-center gap-1 text-xs font-semibold tracking-wider text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {filter}
                <ChevronDown className="w-3 h-3" />
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
        )}

        {/* Product Grid */}
        {category.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {category.products.map((product, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-accent/30 mb-3">
                  <img
                    src={getImage(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Wishlist */}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                    <Heart className="w-4 h-4 text-foreground" />
                  </button>
                  {/* Add to cart */}
                  <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                    <ShoppingBag className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                <h3 className="text-sm text-foreground font-medium leading-snug mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-foreground">{product.price}</span>
                  {product.unit && (
                    <span className="text-xs text-muted-foreground">{product.unit}</span>
                  )}
                </div>
                {product.variants && (
                  <p className="text-xs text-muted-foreground mt-0.5">{product.variants}</p>
                )}
                {product.badge && (
                  <p className="text-xs text-primary mt-0.5">{product.badge}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Les produits arrivent bientôt !</p>
          </div>
        )}

        {/* Promo Banner */}
        <div className="mt-12 bg-primary text-primary-foreground rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold uppercase">
            Arrivage quotidien, coup de cœur assuré !
          </h2>
          <Link to="/" className="mt-3 inline-block text-sm underline">
            Je m'inspire →
          </Link>
        </div>

        {/* SEO Description Block */}
        <section className="mt-16 mb-8 border-t border-border pt-10 max-w-5xl mx-auto">
          <h2
            className="text-2xl md:text-3xl mb-6 text-foreground"
            style={{ fontFamily: "'Dancing Script', cursive", fontStyle: "italic" }}
          >
            {category.seo.title}
          </h2>
          <div className="space-y-4">
            {category.seo.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Category;
