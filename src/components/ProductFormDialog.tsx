import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (data: { name: string; price: string; imageUrl?: string }) => void;
  initialData?: {
    name?: string;
    imageUrl?: string;
    categoryName?: string;
  };
}

const ProductFormDialog = ({ open, onOpenChange, onSaved, initialData }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [unb, setUnb] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    reference: "",
    composition: "",
    width_cm: "",
    weight_gsm: "",
    color: "",
    category: "",
    image_url: "",
  });

  useEffect(() => {
    if (!open) return;

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setUnb(code);
    setPreviewUrl(initialData?.imageUrl ?? "");

    setForm({
      name: initialData?.name ?? "",
      description: "",
      price: "",
      reference: "",
      composition: "",
      width_cm: "",
      weight_gsm: "",
      color: "",
      category: initialData?.categoryName ?? "",
      image_url: initialData?.imageUrl ?? "",
    });
  }, [open, initialData?.name, initialData?.imageUrl, initialData?.categoryName]);

  const update = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
      setPreviewUrl(data.publicUrl);
      update("image_url", data.publicUrl);
      toast({ title: "Photo ajoutée !" });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du produit est requis.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("products").insert({
      name: form.name,
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      reference: form.reference || null,
      composition: form.composition || null,
      width_cm: form.width_cm ? parseFloat(form.width_cm) : null,
      weight_gsm: form.weight_gsm ? parseFloat(form.weight_gsm) : null,
      color: form.color || null,
      category: form.category || null,
      image_url: form.image_url || null,
      unb,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Produit enregistré",
        description: `"${form.name}" a été ajouté.`,
      });
      onSaved?.({ name: form.name, price: form.price ? `${parseFloat(form.price).toFixed(2)} €` : "", imageUrl: form.image_url });
      onOpenChange(false);
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche produit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Photo upload zone */}
          <div className="space-y-1.5">
            <Label>Photo du produit</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors bg-muted/30 flex items-center justify-center overflow-hidden"
              style={{ minHeight: previewUrl ? "auto" : "120px" }}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Aperçu" className="w-full max-h-48 object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm font-medium">
                    {uploading ? "Upload en cours..." : "Cliquez pour ajouter une photo"}
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>UNB (identifiant unique)</Label>
              <Input value={unb} readOnly className="bg-muted font-mono text-sm" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="pf-name">Nom *</Label>
              <Input id="pf-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nom du tissu" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-ref">Référence</Label>
              <Input id="pf-ref" value={form.reference} onChange={(e) => update("reference", e.target.value)} placeholder="REF-001" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-price">Prix (€)</Label>
              <Input id="pf-price" type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="12.90" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-color">Couleur</Label>
              <Input id="pf-color" value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="Bleu marine" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-category">Catégorie</Label>
              <Input id="pf-category" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Coton" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-width">Largeur (cm)</Label>
              <Input id="pf-width" type="number" step="0.1" value={form.width_cm} onChange={(e) => update("width_cm", e.target.value)} placeholder="150" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-weight">Grammage (g/m²)</Label>
              <Input id="pf-weight" type="number" step="0.1" value={form.weight_gsm} onChange={(e) => update("weight_gsm", e.target.value)} placeholder="130" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="pf-compo">Composition</Label>
              <Input id="pf-compo" value={form.composition} onChange={(e) => update("composition", e.target.value)} placeholder="100% coton" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="pf-desc">Description</Label>
              <Textarea id="pf-desc" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Description du produit..." rows={3} />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving || uploading} className="w-full">
            {saving ? "Enregistrement..." : "Enregistrer le produit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
