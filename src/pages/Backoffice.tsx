import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Search, Save, ChevronDown, Package, Eye } from "lucide-react";
import { toast } from "sonner";

interface RawProduct {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  reference: string | null;
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
}

// Category tree matching the site structure
const CATEGORY_TREE: Record<string, string[]> = {
  "Tissu Habillement": [
    "Broderie anglaise", "Bord-côte", "Bouclette", "Chambray", "Coton",
    "Crepe", "Double gaze", "Dentelles", "Fausse fourrure", "Gabardine",
    "Jersey", "Jean et denim", "Lainage et maille", "Lin", "Lycra et Maillot de bain",
    "Polaire", "Popeline de coton", "Satin", "Soie", "Sweat Molleton",
    "Viscose", "Velours", "Voile, mousseline", "Wax",
  ],
  "Tissu Ameublement": [
    "Burlington", "Bouclette", "Coton Imprimé", "Coton uni épais", "Effet Lin",
    "Enduit", "Éponge", "Jacquard", "Lin ameublement", "Simili cuir",
    "Suédine", "Toile de jouy", "Velours ameublement",
  ],
  "Mercerie": [
    "Fils à coudre", "Fermetures & zip", "Boutons à coudre", "Boutons pression et œillets",
    "Élastiques", "Biais couture", "Sangle", "Rubans et galons", "Scratch (Velcro)",
  ],
  "Tissus Enfants": [
    "Jersey imprimé", "Velours milleraies", "Double gaze", "Sweat Molleton",
    "Bord-côte", "PUL", "Tissu doudou", "Flanelle et pilou",
  ],
  "Imprimés": ["Floral", "Géométrique", "Animalier", "Abstrait", "Rayures", "Pois"],
};

const Backoffice = () => {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<RawProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "done">("pending");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<RawProduct>>({});
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, image_url, category, reference, price, sell_price, composition, width_cm, weight_gsm, color, utilisation, description, created_at, qrcode_id")
      .order("created_at", { ascending: false })
      .limit(200);
    setProducts((data as RawProduct[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    if (filter === "pending" && p.sell_price) return false;
    if (filter === "done" && !p.sell_price) return false;
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

  const startEdit = (p: RawProduct) => {
    setEditingId(p.id);
    setEditData({
      category: p.category || "",
      sell_price: p.sell_price,
      composition: p.composition || "",
      width_cm: p.width_cm,
      weight_gsm: p.weight_gsm,
      color: p.color || "",
      utilisation: p.utilisation || "",
      description: p.description || "",
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        category: editData.category || null,
        sell_price: editData.sell_price || null,
        composition: editData.composition || null,
        width_cm: editData.width_cm || null,
        weight_gsm: editData.weight_gsm || null,
        color: editData.color || null,
        utilisation: editData.utilisation || null,
        description: editData.description || null,
      } as any)
      .eq("id", editingId);

    if (error) {
      toast.error("Erreur de sauvegarde");
    } else {
      toast.success("Produit mis à jour !");
      setEditingId(null);
      fetchProducts();
    }
    setSaving(false);
  };

  const CategorySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
    >
      <option value="">— Sélectionner —</option>
      {Object.entries(CATEGORY_TREE).map(([parent, subs]) => (
        <optgroup key={parent} label={parent}>
          {subs.map((sub) => (
            <option key={sub} value={`${parent} / ${sub}`}>
              {sub}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

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

        {/* Search + Filter */}
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
          <div className="flex gap-2">
            {(["pending", "done", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {f === "pending" ? "À traiter" : f === "done" ? "Traités" : "Tous"}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground self-center">
              {filtered.length} produit{filtered.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      {/* Product List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {filter === "pending" ? "Aucun produit à traiter 🎉" : "Aucun produit trouvé"}
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="border border-border rounded-xl overflow-hidden bg-card">
              {/* Product Summary Row */}
              <button
                onClick={() => (editingId === p.id ? setEditingId(null) : startEdit(p))}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent/30 transition-colors"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                  {p.reference && (
                    <p className="text-xs font-mono text-primary">{p.reference}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {p.category || "Sans catégorie"} • {new Date(p.created_at).toLocaleDateString("fr")}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {p.sell_price ? (
                    <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      {p.sell_price.toFixed(2)} €
                    </span>
                  ) : (
                    <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                      À traiter
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      editingId === p.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Edit Panel */}
              {editingId === p.id && (
                <div className="border-t border-border p-4 space-y-4 bg-muted/20">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Catégorie site
                    </label>
                    <CategorySelect
                      value={editData.category || ""}
                      onChange={(v) => setEditData({ ...editData, category: v })}
                    />
                  </div>

                  {/* Prix de vente */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Prix de vente (€/mètre)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.sell_price ?? ""}
                      onChange={(e) =>
                        setEditData({ ...editData, sell_price: e.target.value ? parseFloat(e.target.value) : null })
                      }
                      placeholder="0.00"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  </div>

                  {/* Composition */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Composition
                    </label>
                    <input
                      type="text"
                      value={editData.composition || ""}
                      onChange={(e) => setEditData({ ...editData, composition: e.target.value })}
                      placeholder="Ex: 100% Coton"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Largeur */}
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Laize (cm)
                      </label>
                      <input
                        type="number"
                        value={editData.width_cm ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, width_cm: e.target.value ? parseInt(e.target.value) : null })
                        }
                        placeholder="140"
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                      />
                    </div>
                    {/* Grammage */}
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Grammage (g/m²)
                      </label>
                      <input
                        type="number"
                        value={editData.weight_gsm ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, weight_gsm: e.target.value ? parseInt(e.target.value) : null })
                        }
                        placeholder="150"
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                      />
                    </div>
                  </div>

                  {/* Couleur */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Couleur</label>
                    <input
                      type="text"
                      value={editData.color || ""}
                      onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                      placeholder="Ex: Bleu marine"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  </div>

                  {/* Utilisation */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Utilisation</label>
                    <input
                      type="text"
                      value={editData.utilisation || ""}
                      onChange={(e) => setEditData({ ...editData, utilisation: e.target.value })}
                      placeholder="Ex: Robe, Top, Blouse, Chemise"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                    <textarea
                      value={editData.description || ""}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      placeholder="Description pour le site..."
                      rows={3}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                    />
                  </div>

                  {/* Save */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Backoffice;
