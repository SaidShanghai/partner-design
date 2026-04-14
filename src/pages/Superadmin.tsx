import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Pencil, Trash2, ChevronRight, GripVertical, LogOut,
  Search, Package, FolderTree, ExternalLink
} from "lucide-react";
import FicheProduit from "@/components/FicheProduit";

/* ─── Types ─── */
interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  position: number;
}

interface RawProduct {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  reference: string | null;
  unb: string | null;
  price: number | null;
  sell_price: number | null;
  composition: string | null;
  width_cm: number | null;
  weight_gsm: number | null;
  color: string | null;
  utilisation: string | null;
  description: string | null;
  created_at: string;
  qrcode_id: string | null;
  badge_nouveaute: boolean;
  badge_oekotex: boolean;
  badge_gots: boolean;
  badge_bio: boolean;
  badge_promo: boolean;
  badge_exclusivite: boolean;
  badge_stock_limite: boolean;
  status: string;
}

type Tab = "categories" | "products";

/* ═══════════════════════════════════════════════════════════
   SUPERADMIN PAGE
   ═══════════════════════════════════════════════════════════ */
const Superadmin = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("products");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Superadmin</h1>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Voir le site
            </a>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("products")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              tab === "products"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4" /> Produits
          </button>
          <button
            onClick={() => setTab("categories")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              tab === "categories"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderTree className="w-4 h-4" /> Catégories
          </button>
        </div>
      </header>

      {tab === "products" ? <ProductsTab /> : <CategoriesTab />}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRODUCTS TAB  (mirrors BO but all statuses visible + validate)
   ═══════════════════════════════════════════════════════════ */
const ProductsTab = () => {
  const [products, setProducts] = useState<RawProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"en_traitement" | "valide" | "publie" | "brouillon" | "all">("en_traitement");
  const [selectedProduct, setSelectedProduct] = useState<RawProduct | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setProducts((data as unknown as RawProduct[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.reference?.toLowerCase().includes(s) ||
        p.category?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <>
      {/* Search + Filters */}
      <div className="px-4 py-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, référence..."
            className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["en_traitement", "valide", "publie", "brouillon", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f === "brouillon" ? "Brouillons" : f === "en_traitement" ? "En traitement" : f === "valide" ? "Validés" : f === "publie" ? "Publiés" : "Tous"}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">Aucun produit trouvé</div>
        ) : (
          filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent/30 transition-colors border border-border rounded-xl bg-card"
            >
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                {p.reference && <p className="text-xs font-mono text-primary">{p.reference}</p>}
                <p className="text-xs text-muted-foreground">
                  {p.sell_price != null && <span className="font-medium text-foreground">{Number(p.sell_price).toFixed(2).replace(".", ",")} €</span>}
                  {p.sell_price != null && " • "}
                  {p.category || "Sans catégorie"} • {new Date(p.created_at).toLocaleDateString("fr")}
                </p>
              </div>
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                p.status === "brouillon" ? "bg-orange-500/10 text-orange-600" :
                p.status === "en_traitement" ? "bg-blue-500/10 text-blue-600" :
                p.status === "valide" ? "bg-emerald-500/10 text-emerald-600" :
                "bg-green-500/10 text-green-600"
              }`}>
                {p.status === "brouillon" ? "Brouillon" : p.status === "en_traitement" ? "En traitement" : p.status === "valide" ? "Validé" : "Publié"}
              </span>
            </button>
          ))
        )}
      </div>

      {selectedProduct && (
        <FicheProduit
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdated={fetchProducts}
        />
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   CATEGORIES TAB  (existing superadmin category tree)
   ═══════════════════════════════════════════════════════════ */
const CategoriesTab = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Racine" },
  ]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [catProducts, setCatProducts] = useState<RawProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<RawProduct | null>(null);

  // Build the full category path from breadcrumb (e.g. "Tissu habillement / Jersey")
  const categoryPath = breadcrumb.length > 1
    ? breadcrumb.slice(1).map((b) => b.name).join(" / ")
    : null;

  // Fetch products matching the current category path
  useEffect(() => {
    if (!categoryPath) {
      setCatProducts([]);
      return;
    }
    const fetchCatProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .ilike("category", `%${categoryPath}%`)
        .order("created_at", { ascending: false })
        .limit(50);
      setCatProducts((data as unknown as RawProduct[]) || []);
    };
    fetchCatProducts();
  }, [categoryPath]);

  const fetchCategories = async () => {
    const query = parentId
      ? supabase.from("categories").select("*").eq("parent_id", parentId).order("position")
      : supabase.from("categories").select("*").is("parent_id", null).order("position");

    const { data, error } = await query;
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchCategories();
  }, [parentId]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const maxPos = categories.length > 0 ? Math.max(...categories.map((c) => c.position)) + 1 : 0;
    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      parent_id: parentId,
      position: maxPos,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setNewName("");
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      fetchCategories();
    }
  };

  const handleRename = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from("categories").update({ name: editingName.trim() }).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setEditingId(null);
      fetchCategories();
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...categories];
    const [a, b] = [updated[index], updated[index - 1]];
    await Promise.all([
      supabase.from("categories").update({ position: b.position }).eq("id", a.id),
      supabase.from("categories").update({ position: a.position }).eq("id", b.id),
    ]);
    fetchCategories();
  };

  const drillDown = (cat: Category) => {
    setParentId(cat.id);
    setBreadcrumb((prev) => [...prev, { id: cat.id, name: cat.name }]);
  };

  const goToBreadcrumb = (index: number) => {
    const target = breadcrumb[index];
    setParentId(target.id);
    setBreadcrumb((prev) => prev.slice(0, index + 1));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            <button
              onClick={() => goToBreadcrumb(i)}
              className={`hover:underline ${i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}`}
            >
              {b.name}
            </button>
          </span>
        ))}
      </div>

      {/* Add form */}
      <div className="flex gap-2">
        <Input
          placeholder="Nouvelle catégorie..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Chargement...</p>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">Aucune sous-catégorie ici.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat, index) => (
            <li key={cat.id} className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3">
              <button onClick={() => handleMoveUp(index)} className="text-muted-foreground hover:text-foreground" title="Monter">
                <GripVertical className="w-4 h-4" />
              </button>

              {editingId === cat.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(cat.id)}
                  onBlur={() => setEditingId(null)}
                  autoFocus
                  className="flex-1 h-8"
                />
              ) : (
                <button onClick={() => drillDown(cat)} className="flex-1 text-left text-foreground font-medium hover:underline">
                  {cat.name}
                </button>
              )}

              <button
                onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </li>
          ))}
        </ul>
      )}

      {/* Products in this category */}
      {catProducts.length > 0 && (
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Produits dans « {categoryPath} » ({catProducts.length})
          </h3>
          <ul className="space-y-2">
            {catProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="w-full flex items-center gap-3 p-2 text-left hover:bg-accent/30 transition-colors border border-border rounded-lg bg-card"
              >
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.sell_price != null && `${Number(p.sell_price).toFixed(2).replace(".", ",")} € • `}
                    {p.status === "brouillon" ? "Brouillon" : p.status === "en_traitement" ? "En traitement" : p.status === "valide" ? "Validé" : "Publié"}
                  </p>
                </div>
              </button>
            ))}
          </ul>
        </div>
      )}

      {selectedProduct && (
        <FicheProduit
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdated={() => {
            // Refresh both categories and products
            fetchCategories();
            if (categoryPath) {
              supabase
                .from("products")
                .select("*")
                .ilike("category", `%${categoryPath}%`)
                .order("created_at", { ascending: false })
                .limit(50)
                .then(({ data }) => setCatProducts((data as unknown as RawProduct[]) || []));
            }
          }}
        />
      )}
    </div>
  );
};

export default Superadmin;
