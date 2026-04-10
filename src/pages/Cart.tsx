import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, loading, updateQuantity, removeItem, totalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: { returnUrl: window.location.origin },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: "Erreur de paiement", description: err.message, variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Votre panier</h1>
          <p className="text-muted-foreground mb-6">Connectez-vous pour voir votre panier.</p>
          <Link to="/connexion">
            <Button>Se connecter</Button>
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-8">Votre panier</h1>

        {loading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">Votre panier est vide.</p>
            <Link to="/">
              <Button variant="outline">Continuer mes achats</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-border rounded-sm">
                  {item.product?.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded-sm flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{item.product?.name || "Produit"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.unit_price.toFixed(2)} € / m
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(0.5, item.quantity_meters - 0.5))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium min-w-[60px] text-center">
                        {item.quantity_meters.toFixed(2)} m
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity_meters + 0.5)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-semibold text-foreground">
                      {(item.quantity_meters * item.unit_price).toFixed(2)} €
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-sm p-6 sticky top-4">
                <h2 className="font-semibold text-lg mb-4">Récapitulatif</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-medium">{totalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="text-muted-foreground">Calculée à l'étape suivante</span>
                  </div>
                </div>
                <div className="border-t border-border mt-4 pt-4 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Redirection…" : "Passer commande"}
                </Button>
                <Link to="/" className="block text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors">
                  Continuer mes achats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default Cart;
