import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Search, Package } from "lucide-react";
import { toast } from "sonner";
import FicheProduit from "@/components/FicheProduit";

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

const Backoffice = () => {
  const { signOut } = useAuth();
  const [products, setProducts] = useState<RawProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"brouillon" | "en_traitement" | "valide" | "all">("brouillon");
  const [selectedProduct, setSelectedProduct] = useState<RawProduct | null>(null);

  const isInitialLoad = useRef(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setProducts((data as unknown as RawProduct[]) || []);
    setLoading(false);
    isInitialLoad.current = false;
  };

  useEffect(() => {
    fetchProducts();

    // Realtime: nouveaux produits + mises à jour
    const channel = supabase
      .channel("backoffice-products")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (payload) => {
          const newProd = payload.new as RawProduct;
          setProducts((prev) => {
            if (prev.some((p) => p.id === newProd.id)) return prev;
            return [newProd, ...prev];
          });
          if (!isInitialLoad.current) {
            toast.success("🆕 Nouveau produit terrain", {
              description: `${newProd.name}${newProd.reference ? ` · ${newProd.reference}` : ""}`,
              duration: 6000,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          const updated = payload.new as RawProduct;
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "products" },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setProducts((prev) => prev.filter((p) => p.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const counts = {
    brouillon: products.filter((p) => p.status === "brouillon").length,
    en_traitement: products.filter((p) => p.status === "en_traitement").length,
    valide: products.filter((p) => p.status === "valide").length,
    all: products.length,
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Backoffice</h1>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pb-3 space-y-2">
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
            {(["brouillon", "en_traitement", "valide", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <span>
                  {f === "brouillon" ? "Brouillons" : f === "en_traitement" ? "En traitement" : f === "valide" ? "Validés" : "Tous"}
                </span>
                {counts[f] > 0 && (
                  <span
                    className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      filter === f
                        ? "bg-primary-foreground text-primary"
                        : f === "brouillon"
                        ? "bg-orange-500 text-white"
                        : "bg-foreground/20 text-foreground"
                    }`}
                  >
                    {counts[f]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Product List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {filter === "brouillon" ? "Aucun brouillon à traiter 🎉" : "Aucun produit trouvé"}
          </div>
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
              <div className="shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === "brouillon" ? "bg-orange-500/10 text-orange-600" :
                  p.status === "en_traitement" ? "bg-blue-500/10 text-blue-600" :
                  p.status === "valide" ? "bg-emerald-500/10 text-emerald-600" :
                  "bg-green-500/10 text-green-600"
                }`}>
                  {p.status === "brouillon" ? "Brouillon" : p.status === "en_traitement" ? "En traitement" : p.status === "valide" ? "Validé" : "Publié"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Fiche Produit Modal */}
      {selectedProduct && (
        <FicheProduit
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdated={fetchProducts}
        />
      )}
    </div>
  );
};

export default Backoffice;
