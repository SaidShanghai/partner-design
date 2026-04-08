import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteFooter from "@/components/SiteFooter";
import CategoryProductCard from "@/components/CategoryProductCard";
import ProductFormDialog from "@/components/ProductFormDialog";
import T from "@/components/T";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { categoriesData, type CategoryData } from "@/data/categories";

/** Translates an HTML string while preserving tags */
const TranslatedHtml = ({ html, className }: { html: string; className?: string }) => {
  const { translate, registerText, language } = useLanguage();
  useEffect(() => {
    if (language !== "fr" && html) {
      registerText(html);
    }
  }, [html, language, registerText]);
  return <p className={className} dangerouslySetInnerHTML={{ __html: translate(html) }} />;
};

const imageModules = import.meta.glob("@/assets/*.jpg", { eager: true, import: "default" }) as Record<string, string>;

function getImage(key: string): string {
  const match = Object.entries(imageModules).find(([path]) => path.includes(key));
  return match ? match[1] : "/placeholder.svg";
}

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildFallbackCategory(slug: string): CategoryData {
  const name = slugToName(slug);

  return {
    slug,
    name,
    parentName: "Catalogue",
    shortDescription: `Découvrez notre sélection de ${name.toLowerCase()}. De nouveaux produits sont ajoutés régulièrement.`,
    products: [],
    filters: ["COULEUR", "PLUS DE FILTRES"],
    seo: {
      title: `${name} — Textile Partner`,
      paragraphs: [
        `Retrouvez bientôt notre gamme complète de <strong>${name.toLowerCase()}</strong>. Nous préparons une sélection de qualité pour répondre à tous vos projets couture.`,
      ],
    },
  };
}

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const category = slug ? categoriesData[slug] || buildFallbackCategory(slug) : null;

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <SiteHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4"><T>Catégorie introuvable</T></h1>
          <p className="text-muted-foreground mb-6"><T>Cette catégorie n'existe pas encore.</T></p>
          <Link to="/" className="text-primary hover:underline">
            ← <T>Retour à l'accueil</T>
          </Link>
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
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            <T>Accueil</T>
          </Link>
          <span>/</span>
          <span className="hover:text-foreground transition-colors cursor-pointer"><T>{category.parentName}</T></span>
        </nav>

        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight uppercase mb-4">
            <T>{category.name}</T>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed"><T>{category.shortDescription}</T></p>
        </div>

        {category.filters && (
          <div className="flex items-center gap-6 mb-8 border-b border-border pb-3 overflow-x-auto">
            {category.filters.map((filter) => (
              <button
                key={filter}
                className="flex items-center gap-1 text-xs font-semibold tracking-wider text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                <T>{filter}</T>
                <ChevronDown className="w-3 h-3" />
              </button>
            ))}
            <div className="ml-auto flex items-center gap-4">
              <span className="text-xs text-muted-foreground whitespace-nowrap"><T>Trier par</T> :</span>
              <select className="text-xs bg-transparent text-foreground border border-border rounded px-2 py-1">
                <option><T>Nouveaux produits en premier</T></option>
                <option><T>Prix croissant</T></option>
                <option><T>Prix décroissant</T></option>
              </select>
            </div>
          </div>
        )}

        {category.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {category.products.map((product, index) => (
              <CategoryProductCard
                key={`${category.slug}-${index}`}
                image={getImage(product.image)}
                name={product.name}
                price={product.price}
                unit={product.unit}
                variants={product.variants}
                badge={product.badge}
                categoryName={category.name}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6"><T>Les produits arrivent bientôt !</T></p>
            {isAdmin && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/admin/crm")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  CRM
                </button>
                <button
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <T>Ajouter un produit</T>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin: also show add button after existing products */}
        {isAdmin && category.products.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate("/admin/crm")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              CRM
            </button>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <T>Ajouter un produit</T>
            </button>
          </div>
        )}

        <div className="mt-12 bg-primary text-primary-foreground rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold uppercase"><T>Arrivage quotidien, coup de cœur assuré !</T></h2>
          <Link to="/" className="mt-3 inline-block text-sm underline">
            <T>Je m'inspire</T> →
          </Link>
        </div>

        <section className="mt-16 mb-8 border-t border-border pt-10 max-w-5xl mx-auto">
          <h2
            className="text-2xl md:text-3xl mb-6 text-foreground"
            style={{ fontFamily: "'Dancing Script', cursive", fontStyle: "italic" }}
          >
            <T>{category.seo.title}</T>
          </h2>
          <div className="space-y-4">
            {category.seo.paragraphs.map((paragraph, index) => (
              <TranslatedHtml
                key={index}
                html={paragraph}
                className="text-sm text-muted-foreground leading-relaxed"
              />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={{ categoryName: category.name }}
      />
    </div>
  );
};

export default Category;
