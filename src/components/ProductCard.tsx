import { useState, useRef, useCallback } from "react";
import { Heart, Plus, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductFormDialog from "./ProductFormDialog";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  isNew?: boolean;
  variants?: number;
}

const ProductCard = ({ image, name, price, isNew = true, variants }: ProductCardProps) => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [displayImage, setDisplayImage] = useState(image);
  const [uploading, setUploading] = useState(false);
  const [liked, setLiked] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
      setDisplayImage(urlData.publicUrl);
      toast({ title: "Photo mise à jour" });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="group relative">
        <div className="relative overflow-hidden rounded-sm">
          {isNew && (
            <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
              Nouveauté
            </span>
          )}

          {/* Heart - top right (always visible) */}
          <button
            onClick={() => setLiked((v) => !v)}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors shadow-sm ${liked ? "text-red-500" : "text-foreground hover:text-primary"}`}
            aria-label="Ajouter aux favoris"
          >
            <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
          </button>

          {/* Admin: (+) button - bottom left */}
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); setFormOpen(true); }}
              className="absolute bottom-3 left-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-background/90 border border-border text-foreground hover:text-primary hover:border-primary transition-colors shadow-sm"
              aria-label="Fiche produit"
              title="Fiche produit"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Admin: Camera button - center */}
          {isAdmin && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              aria-label="Changer la photo"
              title="Changer la photo"
              disabled={uploading}
            >
              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-background/90 border border-border text-foreground hover:text-primary hover:border-primary transition-colors shadow-sm pointer-events-auto">
                <Camera className="w-5 h-5" />
              </span>
            </button>
          )}

          {/* Hidden file input */}
          {isAdmin && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          )}

          <img
            src={displayImage}
            alt={name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            width={640}
            height={640}
          />
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
            {name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-foreground">{price}</p>
          {variants && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {variants} teintes
            </p>
          )}
        </div>
      </div>

      {/* Product form dialog */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={{ name, imageUrl: displayImage }}
      />
    </>
  );
};

export default ProductCard;
