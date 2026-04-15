import { useRef, useState } from "react";
import { Camera, Heart, Plus, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductFormDialog from "./ProductFormDialog";
import QuantitySelector from "./QuantitySelector";

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
  const { addToCart } = useCart();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayImage, setDisplayImage] = useState(image);
  const [displayName, setDisplayName] = useState(name);
  const [displayPrice, setDisplayPrice] = useState(price);
  const [displayBadge, setDisplayBadge] = useState(badge ?? "");
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showMetrage, setShowMetrage] = useState(false);

  // Parse numeric price from string like "5,90 €"
  const parsePrice = (p: string): number => {
    const cleaned = p.replace(/[^\d,\.]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  };

  const canManage = !loading && isAdmin;
  const displayBadges = displayBadge
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const hasNewBadge = displayBadges.some((value) => value.toLowerCase() === "nouveauté");
  const secondaryBadges = displayBadges.filter((value) => value.toLowerCase() !== "nouveauté");

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
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {hasNewBadge && (
            <span className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
              Nouveauté
            </span>
          )}

          <button
            onClick={() => setLiked((v) => !v)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm z-10 ${liked ? "bg-background text-red-500" : "bg-background/80 text-foreground hover:text-primary"}`}
            aria-label="Ajouter aux favoris"
          >
            <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
          </button>

          {canManage && (
            <button
              onClick={(e) => { e.stopPropagation(); setFormOpen(true); }}
              className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background z-30"
              aria-label="Fiche produit"
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

          <button
            onClick={(e) => { e.stopPropagation(); setShowMetrage((v) => !v); }}
            className="absolute bottom-3 right-3 z-30 w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-md border border-border text-foreground hover:text-primary hover:border-primary transition-colors"
            aria-label="Ajouter au panier"
            title="Ajouter au panier"
          >
            <ShoppingBag className="w-5 h-5" />
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

        {showMetrage && (
          <QuantitySelector
            pricePerMeter={parsePrice(displayPrice)}
            onConfirm={async (meters) => {
              const numPrice = parsePrice(displayPrice);
              if (numPrice <= 0) {
                toast({ title: "Erreur", description: "Prix invalide.", variant: "destructive" });
                return;
              }
              const { data: productId, error: rpcErr } = await supabase.rpc("find_or_create_product", {
                _name: displayName,
                _price: numPrice,
                _image_url: displayImage || null,
                _category: categoryName || null,
              });
              if (rpcErr || !productId) {
                toast({ title: "Erreur", description: "Impossible d'ajouter ce produit.", variant: "destructive" });
                return;
              }
              await addToCart(productId as string, meters, numPrice);
              setShowMetrage(false);
            }}
            onCancel={() => setShowMetrage(false)}
          />
        )}

        <h3 className="text-sm text-foreground font-medium leading-snug mb-1 group-hover:text-primary transition-colors">
          {displayName}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">{displayPrice}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {variants && <p className="text-xs text-muted-foreground mt-0.5">{variants}</p>}
        {secondaryBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {secondaryBadges.map((value) => (
              <span key={value} className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                {value}
              </span>
            ))}
          </div>
        )}
      </div>

      <ProductFormDialog
        key={`${displayName}-${displayImage}-${displayBadge}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={(data) => {
          if (data.name) setDisplayName(data.name);
          if (data.price) setDisplayPrice(data.price);
          setDisplayBadge(data.badge ?? "");
        }}
        initialData={{
          name: displayName,
          imageUrl: displayImage,
          categoryName,
          badge: displayBadge,
        }}
      />
    </>
  );
};

export default CategoryProductCard;
