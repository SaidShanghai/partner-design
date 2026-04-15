import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  product_id: string;
  quantity_meters: number;
  unit_price: number;
  product?: {
    name: string;
    image_url: string | null;
    price: number | null;
    sell_price: number | null;
    weight_per_meter: number | null;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, meters: number, unitPrice: number) => Promise<void>;
  updateQuantity: (itemId: string, meters: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  totalItems: 0,
  totalPrice: 0,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity_meters, unit_price, products(name, image_url, price, sell_price, weight_per_meter)")
      .eq("user_id", user.id);

    if (!error && data) {
      setItems(data.map((d: any) => ({ ...d, product: d.products })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, meters: number, unitPrice: number) => {
    if (!user) {
      toast({ title: "Connectez-vous", description: "Vous devez être connecté pour ajouter au panier.", variant: "destructive" });
      return;
    }

    // Check if product already in cart
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      const newQty = existing.quantity_meters + meters;
      await updateQuantity(existing.id, newQty);
      return;
    }

    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity_meters: meters,
      unit_price: unitPrice,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ajouté au panier" });
      await fetchCart();
    }
  }, [user, items, fetchCart, toast]);

  const updateQuantity = useCallback(async (itemId: string, meters: number) => {
    const { error } = await supabase.from("cart_items").update({ quantity_meters: meters }).eq("id", itemId);
    if (!error) await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    if (!error) await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  }, [user]);

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, i) => sum + i.quantity_meters * (i.product?.sell_price ?? i.product?.price ?? i.unit_price), 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
