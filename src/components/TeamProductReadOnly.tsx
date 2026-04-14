import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Camera, Store } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  reference: string | null;
  price: number | null;
  sell_price: number | null;
  status: string;
  qrcode_id: string | null;
}

interface Props {
  product: Product;
  onClose: () => void;
}

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

const TeamProductReadOnly = ({ product, supplierCode, onClose }: Props) => {
  const currentStatus = product.status || "brouillon";

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="text-muted-foreground">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Fiche produit</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentStatus] || ""}`}>
            {STATUS_LABELS[currentStatus] || currentStatus}
          </span>
        </div>
        <div className="w-6" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {supplierCode && (
          <div className="bg-muted/50 rounded-xl px-4 py-2 text-xs text-muted-foreground font-mono flex items-center gap-1">
            <Store className="w-3 h-3" />
            {supplierCode}
          </div>
        )}

        {/* Photo */}
        <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera className="w-12 h-12 text-muted-foreground mb-2" />
              <span className="text-muted-foreground text-sm">Pas de photo</span>
            </>
          )}
        </div>

        {/* Référence */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Référence du tissu</label>
          <input
            type="text"
            value={product.name || "—"}
            disabled
            className="w-full h-12 rounded-xl border border-input bg-muted/50 px-4 text-base text-foreground"
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Prix au mètre en RMB</label>
          <div className="relative">
            <input
              type="text"
              value={product.price != null ? product.price.toFixed(2) : "—"}
              disabled
              className="w-full h-12 rounded-xl border border-input bg-muted/50 px-4 pr-16 text-base text-foreground"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥/m</span>
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
          <input
            type="text"
            value={product.category || "—"}
            disabled
            className="w-full h-12 rounded-xl border border-input bg-muted/50 px-4 text-base text-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default TeamProductReadOnly;
