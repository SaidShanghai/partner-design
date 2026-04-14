import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Camera, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  qrcodeId: string;
  supplierCode: string;
  onClose: () => void;
  onSaved: () => void;
}

const TeamProductForm = ({ qrcodeId, supplierCode, onClose, onSaved }: Props) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Le nom du tissu est requis");
      return;
    }

    setSaving(true);
    try {
      let imageUrl: string | null = null;
      let overlayCode: string | null = null;

      if (imageFile) {
        // Call burn-overlay edge function
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("supplier_code", supplierCode);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const resp = await fetch(
          `https://${projectId}.supabase.co/functions/v1/burn-overlay`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!resp.ok) {
          const errBody = await resp.json().catch(() => ({}));
          throw new Error(errBody.error || "Erreur lors du traitement de l'image");
        }

        const result = await resp.json();
        imageUrl = result.image_url;
        overlayCode = result.overlay_code;
      }

      const { error: insertErr } = await supabase.from("products").insert({
        name: name.trim(),
        price: price ? parseFloat(price) : null,
        category: category.trim() || null,
        image_url: imageUrl || "",
        qrcode_id: qrcodeId,
        reference: overlayCode || null,
      } as any);

      if (insertErr) throw insertErr;

      toast.success("Produit enregistré !");
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="text-muted-foreground">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Nouveau produit</h2>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="text-primary disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Supplier info */}
        <div className="bg-muted/50 rounded-xl px-4 py-2 text-xs text-muted-foreground font-mono">
          🏪 {supplierCode}
        </div>

        {/* Photo */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 overflow-hidden"
        >
          {preview ? (
            <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera className="w-12 h-12 text-muted-foreground mb-2" />
              <span className="text-muted-foreground text-sm">Prendre une photo du produit</span>
            </>
          )}
        </button>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nom du tissu *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Coton imprimé floral"
            className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Catégorie (optionnel)</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ex: Soie, Coton, Polyester..."
            className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Prix (optionnel)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default TeamProductForm;
