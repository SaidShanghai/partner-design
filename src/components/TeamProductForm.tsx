import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Camera, Loader2, Check, Plus, Palette, ArrowRight, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Props {
  qrcodeId: string;
  supplierCode: string;
  onClose: () => void;
  onSaved: () => void;
  onFinishSession: () => void;
}

type Step = "form" | "post-save" | "variants";

const TeamProductForm = ({ qrcodeId, supplierCode, onClose, onSaved, onFinishSession }: Props) => {
  const prefix = supplierCode ? `${supplierCode}_` : "";
  const [step, setStep] = useState<Step>("form");
  const [nameSuffix, setNameSuffix] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedProductName, setSavedProductName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Variants state
  const [variantPhotos, setVariantPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [variantFiles, setVariantFiles] = useState<(File | null)[]>([null, null, null, null, null, null]);
  const [savingVariants, setSavingVariants] = useState(false);
  const variantFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleVariantFile = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newPhotos = [...variantPhotos];
    const newFiles = [...variantFiles];
    newPhotos[index] = URL.createObjectURL(file);
    newFiles[index] = file;
    setVariantPhotos(newPhotos);
    setVariantFiles(newFiles);
    // Auto-add more slots if all are filled
    if (newPhotos.every(p => p !== null)) {
      setVariantPhotos([...newPhotos, null, null]);
      setVariantFiles([...newFiles, null, null]);
    }
  };

  const uploadImage = async (file: File): Promise<{ imageUrl: string; overlayCode: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("supplier_code", supplierCode);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const resp = await fetch(
      `https://${projectId}.supabase.co/functions/v1/burn-overlay`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
        body: formData,
      }
    );

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      throw new Error(errBody.error || "Erreur lors du traitement de l'image");
    }

    const result = await resp.json();
    return { imageUrl: result.image_url, overlayCode: result.overlay_code };
  };

  const handleSave = async (nextStep: Step = "post-save") => {
    if (!nameSuffix.trim()) {
      toast.error("La référence du tissu est requise");
      return;
    }
    if (!price.trim()) {
      toast.error("Le prix au mètre en RMB est requis");
      return;
    }

    setSaving(true);
    try {
      let imageUrl: string | null = null;
      let overlayCode: string | null = null;

      if (imageFile) {
        const result = await uploadImage(imageFile);
        if (result) {
          imageUrl = result.imageUrl;
          overlayCode = result.overlayCode;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error: insertErr } = await supabase.from("products").insert({
        name: `${prefix}${nameSuffix.trim()}`,
        price: price ? parseFloat(price) : null,
        category: category.trim() || null,
        image_url: imageUrl || "",
        qrcode_id: qrcodeId,
        reference: overlayCode || null,
        created_by: user?.id || null,
      } as any);

      if (insertErr) throw insertErr;

      toast.success("Produit enregistré !");
      setSavedProductName(`${prefix}${nameSuffix.trim()}`);
      onSaved();
      setStep(nextStep);
      if (nextStep === "form") handleNext();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVariants = async () => {
    const filesToUpload = variantFiles.filter((f): f is File => f !== null);
    if (filesToUpload.length === 0) {
      toast.error("Aucune photo de variante à enregistrer");
      return;
    }

    setSavingVariants(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      for (let i = 0; i < filesToUpload.length; i++) {
        const result = await uploadImage(filesToUpload[i]);
        await supabase.from("products").insert({
          name: `${savedProductName}_var${i + 1}`,
          price: price ? parseFloat(price) : null,
          category: category.trim() || null,
          image_url: result?.imageUrl || "",
          qrcode_id: qrcodeId,
          reference: result?.overlayCode || null,
          created_by: user?.id || null,
        } as any);
      }

      toast.success(`${filesToUpload.length} variante(s) enregistrée(s) !`);
      onSaved();
      setStep("post-save");
      // Reset variants
      setVariantPhotos([null, null, null, null, null, null]);
      setVariantFiles([null, null, null, null, null, null]);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement des variantes");
    } finally {
      setSavingVariants(false);
    }
  };

  const handleNext = () => {
    // Reset form for next product
    setNameSuffix("");
    setPrice("");
    setCategory("");
    setImageFile(null);
    setPreview(null);
    setSavedProductName("");
    setStep("form");
  };

  const handleFinish = () => {
    onFinishSession();
  };

  // ──────── POST-SAVE SCREEN ────────
  if (step === "post-save") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div />
          <h2 className="text-lg font-bold text-foreground">✅ Produit enregistré</h2>
          <div />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <p className="text-sm text-muted-foreground text-center mb-4">
            <span className="font-mono text-foreground">{savedProductName}</span> a été enregistré avec succès.
          </p>

          {/* Variante de couleur */}
          <button
            onClick={() => setStep("variants")}
            className="w-full bg-primary text-primary-foreground rounded-2xl p-5 flex items-center gap-4 active:scale-[0.97] transition-transform shadow-lg"
          >
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Palette className="w-7 h-7" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-lg">Variante de couleur</p>
              <p className="text-sm opacity-80">Photographier les couleurs disponibles</p>
            </div>
          </button>

          {/* Suivant */}
          <button
            onClick={handleNext}
            className="w-full bg-card border-2 border-border rounded-2xl p-5 flex items-center gap-4 active:scale-[0.97] transition-transform shadow-md"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ArrowRight className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-lg text-foreground">Suivant</p>
              <p className="text-sm text-muted-foreground">Passer à la référence suivante</p>
            </div>
          </button>

          {/* Terminer */}
          <button
            onClick={handleFinish}
            className="w-full bg-card border-2 border-border rounded-2xl p-5 flex items-center gap-4 active:scale-[0.97] transition-transform shadow-md"
          >
            <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <LogOut className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-lg text-foreground">Terminer le magasin</p>
              <p className="text-sm text-muted-foreground">Saisie terminée, passer au prochain</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ──────── VARIANTS SCREEN ────────
  if (step === "variants") {
    const hasAnyPhoto = variantFiles.some(f => f !== null);
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={() => setStep("post-save")} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-foreground">🎨 Variantes couleur</h2>
          <button
            onClick={handleSaveVariants}
            disabled={savingVariants || !hasAnyPhoto}
            className="text-primary disabled:opacity-40"
          >
            {savingVariants ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Prenez en photo chaque variante de couleur pour <span className="font-mono text-foreground">{savedProductName}</span>
          </p>

          <div className="grid grid-cols-3 gap-3">
            {variantPhotos.map((photo, i) => (
              <div key={i}>
                <input
                  ref={(el) => { variantFileRefs.current[i] = el; }}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleVariantFile(i, e)}
                />
                <button
                  onClick={() => variantFileRefs.current[i]?.click()}
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden active:scale-95 transition-transform"
                >
                  {photo ? (
                    <img src={photo} alt={`Variante ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ──────── FORM SCREEN ────────
  const canSave = nameSuffix.trim() && price.trim();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="text-muted-foreground">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Nouveau produit</h2>
        <div className="w-6" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
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

        {/* Référence */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Référence du tissu <span className="text-destructive">*</span></label>
          <div className="flex items-center h-12 rounded-xl border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary">
            <span className="pl-4 text-sm text-muted-foreground font-mono whitespace-nowrap">{prefix}</span>
            <input
              type="text"
              value={nameSuffix}
              onChange={(e) => setNameSuffix(e.target.value)}
              placeholder="nom-du-tissu"
              className="flex-1 h-full bg-transparent px-1 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Prix */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Prix au mètre en RMB <span className="text-destructive">*</span></label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full h-12 rounded-xl border border-input bg-background px-4 pr-16 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥/m</span>
          </div>
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

        {/* ── ACTION BUTTONS ── */}
        <div className="space-y-3 pt-4 border-t border-border">
          {/* Enregistrer + Variante */}
          <button
            onClick={() => handleSave("variants")}
            disabled={saving || !canSave}
            className="w-full bg-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform shadow-md disabled:opacity-40"
          >
            <Palette className="w-6 h-6 shrink-0" />
            <div className="text-left flex-1">
              <p className="font-bold">Variante de couleur</p>
              <p className="text-xs opacity-80">Enregistrer puis ajouter des variantes</p>
            </div>
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          </button>

          {/* Enregistrer + Suivant */}
          <button
            onClick={() => handleSave("form")}
            disabled={saving || !canSave}
            className="w-full bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform shadow-md disabled:opacity-40"
          >
            <ArrowRight className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-left flex-1">
              <p className="font-bold text-foreground">Suivant</p>
              <p className="text-xs text-muted-foreground">Enregistrer et passer à la référence suivante</p>
            </div>
          </button>

          {/* Terminer le magasin */}
          <button
            onClick={async () => {
              if (canSave) {
                await handleSave();
              }
              handleFinish();
            }}
            disabled={saving}
            className="w-full bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform shadow-md"
          >
            <LogOut className="w-6 h-6 text-red-500 shrink-0" />
            <div className="text-left flex-1">
              <p className="font-bold text-foreground">Terminer le magasin</p>
              <p className="text-xs text-muted-foreground">Saisie terminée, prochain magasin</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamProductForm;
