import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Trash2, Camera, Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { useAuth, AppRole } from "@/hooks/useAuth";

interface Product {
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
  badge_nouveaute: boolean;
  badge_oekotex: boolean;
  badge_gots: boolean;
  badge_bio: boolean;
  badge_promo: boolean;
  badge_exclusivite: boolean;
  badge_stock_limite: boolean;
  status?: string;
  qrcode_id?: string | null;
}

interface Props {
  product: Product;
  onClose: () => void;
  onUpdated: () => void;
}

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
  "Sacs": ["Sacs à main", "Cabas", "Pochettes"],
  "Patrons de couture": ["Robes", "Hauts", "Pantalons", "Accessoires"],
  "Tricot et crochet": ["Laine", "Coton", "Aiguilles", "Crochets"],
};

const BADGES = [
  { key: "badge_nouveaute", label: "Nouveauté" },
  { key: "badge_oekotex", label: "Oeko-Tex" },
  { key: "badge_gots", label: "GOTS" },
  { key: "badge_bio", label: "Bio" },
  { key: "badge_promo", label: "Promo" },
  { key: "badge_exclusivite", label: "Exclusivité" },
  { key: "badge_stock_limite", label: "Stock limité" },
] as const;

const FicheProduit = ({ product, onClose, onUpdated }: Props) => {
  const { role } = useAuth();
  const isReadOnly = role === "team";
  const canSeeCodes = role === "superadmin" || role === "admin" || role === "backoffice";
  const canEditFields = role === "superadmin" || role === "admin" || role === "backoffice";
  const canEditBadges = role === "superadmin" || role === "admin" || role === "backoffice";

  const derivedSellPrice =
    product.sell_price ??
    (product.price != null
      ? Number(((product.status === "publie" ? product.price : product.price * 3)).toFixed(2))
      : null);

  const [form, setForm] = useState({
    name: product.name || "",
    category: product.category || "",
    reference: product.reference || "",
    price: product.price,
    sell_price: derivedSellPrice,
    composition: product.composition || "",
    width_cm: product.width_cm,
    weight_gsm: product.weight_gsm,
    color: product.color || "",
    description: product.description || "",
    image_url: product.image_url || "",
  });

  const [badges, setBadges] = useState({
    badge_nouveaute: product.badge_nouveaute,
    badge_oekotex: product.badge_oekotex,
    badge_gots: product.badge_gots,
    badge_bio: product.badge_bio,
    badge_promo: product.badge_promo,
    badge_exclusivite: product.badge_exclusivite,
    badge_stock_limite: product.badge_stock_limite,
  });

  const [saving, setSaving] = useState(false);
  const [supplierCode, setSupplierCode] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product.qrcode_id) {
      supabase
        .from("wechat_qrcodes")
        .select("supplier_code")
        .eq("id", product.qrcode_id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setSupplierCode(data.supplier_code);
        });
    }
  }, [product.qrcode_id]);

  const toggleBadge = async (key: keyof typeof badges) => {
    if (!canEditBadges) return;
    const newVal = !badges[key];
    setBadges((prev) => ({ ...prev, [key]: newVal }));
    // Auto-save
    await supabase.from("products").update({ [key]: newVal } as any).eq("id", product.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop();
    const path = `products/${product.id}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erreur upload image");
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    toast.success("Image mise à jour");
  };

  const handleDeleteImage = () => {
    setForm((prev) => ({ ...prev, image_url: "" }));
  };

  const STATUS_LABELS: Record<string, string> = {
    brouillon: "Brouillon",
    en_traitement: "En traitement",
    valide: "Validé",
    publie: "Publié",
  };

  const STATUS_COLORS: Record<string, string> = {
    brouillon: "bg-orange-500/10 text-orange-600",
    en_traitement: "bg-blue-500/10 text-blue-600",
    valide: "bg-emerald-500/10 text-emerald-600",
    publie: "bg-green-500/10 text-green-600",
  };

  const currentStatus = product.status || "brouillon";

  const getNextStatus = (): string | null => {
    if (role === "backoffice") {
      if (currentStatus === "brouillon") return "en_traitement";
      if (currentStatus === "en_traitement") return "valide";
      return null;
    }
    if (role === "superadmin" || role === "admin") {
      if (currentStatus === "valide") return "publie";
      if (currentStatus !== "publie") return "publie"; // admin can publish directly
      return null;
    }
    return null;
  };

  const nextStatus = getNextStatus();

  const handleStatusChange = async () => {
    if (!nextStatus) return;
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        status: nextStatus,
        price: form.sell_price ?? null,
        sell_price: form.sell_price ?? null,
      } as any)
      .eq("id", product.id);
    if (error) {
      toast.error("Erreur changement de statut");
    } else {
      toast.success(`Statut → ${STATUS_LABELS[nextStatus]}`);
      onUpdated();
      onClose();
    }
    setSaving(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: form.name.trim(),
        category: form.category || null,
        reference: form.reference || null,
        price: form.sell_price ?? null,
        sell_price: form.sell_price ?? null,
        composition: form.composition || null,
        width_cm: form.width_cm || null,
        weight_gsm: form.weight_gsm || null,
        color: form.color || null,
        description: form.description || null,
        image_url: form.image_url || null,
      } as any)
      .eq("id", product.id);

    if (error) {
      toast.error("Erreur de sauvegarde");
    } else {
      toast.success("Produit enregistré !");
      onUpdated();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8">
      <div className="bg-background rounded-2xl w-full max-w-3xl mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-foreground">Fiche produit</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentStatus] || ""}`}>
              {STATUS_LABELS[currentStatus] || currentStatus}
            </span>
            {supplierCode && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                <Store className="w-3 h-3" />
                {supplierCode}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Image + Badges */}
            <div className="md:w-[320px] shrink-0 space-y-4">
              {/* Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                {form.image_url ? (
                  <>
                    <img src={form.image_url} alt={form.name} className="w-full h-full object-cover" />
                    {canEditFields && (
                      <button
                        onClick={handleDeleteImage}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : canEditFields ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center text-muted-foreground"
                  >
                    <Camera className="w-10 h-10 mb-2" />
                    <span className="text-sm">Ajouter une photo</span>
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Camera className="w-10 h-10" />
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              {/* Badges */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Badges</h3>
                <div className="space-y-1.5">
                  {BADGES.map(({ key, label }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 text-sm ${canEditBadges ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <input
                        type="checkbox"
                        checked={badges[key]}
                        onChange={() => toggleBadge(key)}
                        disabled={!canEditBadges}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-60"
                      />
                      <span className="text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Fields */}
            <div className="flex-1 space-y-4">
              {/* UNB + Category row */}
              {canSeeCodes && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">UNB (identifiant unique)</label>
                    <input
                      type="text"
                      value={product.unb || "—"}
                      disabled
                      className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Catégorie</label>
                    {canEditFields ? (
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                      >
                        <option value="">— Sélectionner —</option>
                        {Object.entries(CATEGORY_TREE).map(([parent, subs]) => (
                          <optgroup key={parent} label={parent}>
                            {subs.map((sub) => (
                              <option key={sub} value={`${parent} / ${sub}`}>{sub}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    ) : (
                      <input type="text" value={form.category || "—"} disabled className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm" />
                    )}
                  </div>
                </div>
              )}

              {!canSeeCodes && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Catégorie</label>
                  <input type="text" value={form.category || "—"} disabled className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm" />
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Nom *</label>
                {canEditFields ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                  />
                ) : (
                  <input type="text" value={form.name} disabled className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm" />
                )}
              </div>

              {/* Référence + Prix */}
              <div className="grid grid-cols-2 gap-4">
                {canSeeCodes && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Référence (UNS)</label>
                    <input
                      type="text"
                      value={product.reference || "—"}
                      disabled
                      className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm text-foreground"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Prix (€)</label>
                  {canEditFields ? (
                    <input
                      type="number"
                      step="0.01"
                      value={form.sell_price ?? ""}
                      onChange={(e) => setForm({ ...form, sell_price: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="0.00"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  ) : (
                    <input type="text" value={form.sell_price ? `${form.sell_price.toFixed(2)}` : "—"} disabled className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm" />
                  )}
                </div>
              </div>

              {/* Couleur + Composition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Couleur</label>
                  {canEditFields ? (
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="Bleu marine"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  ) : (
                    <input type="text" value={form.color || "—"} disabled className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Composition</label>
                  {canEditFields ? (
                    <input
                      type="text"
                      value={form.composition}
                      onChange={(e) => setForm({ ...form, composition: e.target.value })}
                      placeholder="100% coton"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  ) : (
                    <input type="text" value={form.composition || "—"} disabled className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm" />
                  )}
                </div>
              </div>

              {/* Largeur + Grammage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Largeur (cm)</label>
                  {canEditFields ? (
                    <input
                      type="number"
                      value={form.width_cm ?? ""}
                      onChange={(e) => setForm({ ...form, width_cm: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="150"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  ) : (
                    <input type="text" value={form.width_cm ?? "—"} disabled className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Grammage (g/m²)</label>
                  {canEditFields ? (
                    <input
                      type="number"
                      value={form.weight_gsm ?? ""}
                      onChange={(e) => setForm({ ...form, weight_gsm: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="130"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    />
                  ) : (
                    <input type="text" value={form.weight_gsm ?? "—"} disabled className="w-full h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm" />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Description</label>
                {canEditFields ? (
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description du produit..."
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y"
                  />
                ) : (
                  <div className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm min-h-[60px]">
                    {form.description || "—"}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {canEditFields && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {saving ? "..." : "Enregistrer"}
                  </button>
                  {nextStatus && (
                    <button
                      onClick={handleStatusChange}
                      disabled={saving}
                      className="flex-1 h-12 rounded-xl bg-emerald-600 text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                    >
                      {STATUS_LABELS[nextStatus]} →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FicheProduit;
