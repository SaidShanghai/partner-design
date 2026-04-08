import { useRef, useState } from "react";
import { Camera, Heart, Plus, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductFormDialog from "./ProductFormDialog";

interface CategoryProductCardProps {
  image: string;
  name: string;
  price: string;
  unit?: string;
  variants?: string;
  badge?: string;
  categoryName?: string;
}

const CategoryProductCard = ({
  image,
  name,
  price,
  unit,
  variants,
  badge,
  categoryName,
}: CategoryProductCardProps) => {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayImage, setDisplayImage] = useState(image);
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const canManage = !loading && isAdmin;

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const extension = file.name.split(".").pop() || "jpg";
    const filePath = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({
        title: "Erreur d'upload",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
      setDisplayImage(data.publicUrl);
      toast({ title: "Photo mise à jour" });
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="group cursor-pointer">
        <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-accent/30 mb-3">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10">
            <Heart className="w-4 h-4 text-foreground" />
          </button>

          {canManage && (
            <button
              onClick={() => setFormOpen(true)}
              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-20"
              aria-label="Ouvrir la fiche produit"
              title="Fiche produit"
              type="button"
            >
              <Plus className="w-4 h-4 text-foreground" />
            </button>
          )}

          {canManage && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full bg-background/85 border border-border flex items-center justify-center shadow-sm hover:bg-background pointer-events-auto"
                aria-label="Changer la photo"
                title="Changer la photo"
                type="button"
                disabled={uploading}
              >
                <Camera className="w-5 h-5 text-foreground" />
              </button>
            </div>
          )}

          <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-10">
            <ShoppingBag className="w-4 h-4 text-foreground" />
          </button>

          {canManage && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          )}
        </div>

        <h3 className="text-sm text-foreground font-medium leading-snug mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">{price}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {variants && <p className="text-xs text-muted-foreground mt-0.5">{variants}</p>}
        {badge && <p className="text-xs text-primary mt-0.5">{badge}</p>}
      </div>

      <ProductFormDialog
        key={`${name}-${displayImage}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={{
          name,
          imageUrl: displayImage,
          categoryName,
        }}
      />
    </>
  );
};

export default CategoryProductCard;
