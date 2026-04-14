import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Camera, QrCode, Image, Package, Clock, Store, Plus, ArrowLeft } from "lucide-react";
import TeamProductForm from "@/components/TeamProductForm";
import WeChatQRUpload from "@/components/WeChatQRUpload";
import FicheProduit from "@/components/FicheProduit";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  position: number;
}

interface ProductRow {
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
  created_at: string;
  qrcode_id: string | null;
  badge_nouveaute: boolean;
  badge_oekotex: boolean;
  badge_gots: boolean;
  badge_bio: boolean;
  badge_promo: boolean;
  badge_exclusivite: boolean;
  badge_stock_limite: boolean;
}

const CATEGORY_COLORS = [
  "bg-rose-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
];

const Team = () => {
  const { user, signOut } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentParent, setCurrentParent] = useState<string | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [viewMode, setViewMode] = useState<"categories" | "products">("categories");
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);

  // Session state
  const [showForm, setShowForm] = useState(false);
  const [showQRUpload, setShowQRUpload] = useState(false);
  const [activeQrcodeId, setActiveQrcodeId] = useState<string | null>(null);
  const [activeSupplierCode, setActiveSupplierCode] = useState<string | null>(null);
  const [myProducts, setMyProducts] = useState<ProductRow[]>([]);
  const [loadingMyProducts, setLoadingMyProducts] = useState(false);

  const fetchCategories = async (parentId: string | null) => {
    setLoadingCats(true);
    const query = parentId
      ? supabase.from("categories").select("*").eq("parent_id", parentId).order("position")
      : supabase.from("categories").select("*").is("parent_id", null).order("position");
    const { data } = await query;
    setCategories(data || []);
    setLoadingCats(false);

    // If no subcategories, load products for this category
    if (data && data.length === 0 && parentId) {
      loadProducts(parentId);
    }
  };

  const loadProducts = async (categoryId: string) => {
    setLoadingProducts(true);
    setViewMode("products");
    // Get category name to filter products
    const { data: cat } = await supabase.from("categories").select("name").eq("id", categoryId).single();
    if (cat) {
      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .ilike("category", `%${cat.name}%`)
        .order("created_at", { ascending: false })
        .limit(100);
      setProducts((prods as unknown as ProductRow[]) || []);
    }
    setLoadingProducts(false);
  };

  const fetchMyProducts = async () => {
    if (!user) return;
    setLoadingMyProducts(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("created_by", user.id)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });
    setMyProducts((data as unknown as ProductRow[]) || []);
    setLoadingMyProducts(false);
  };

  useEffect(() => {
    fetchCategories(null);
    fetchMyProducts();
  }, []);

  const drillDown = async (cat: Category) => {
    setCurrentParent(cat.id);
    setParentName(cat.name);
    // Check for subcategories
    const { data: subs } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", cat.id)
      .limit(1);

    if (subs && subs.length > 0) {
      setViewMode("categories");
      fetchCategories(cat.id);
    } else {
      // Leaf category → show products
      loadProducts(cat.id);
    }
  };

  const goBack = () => {
    if (viewMode === "products") {
      setViewMode("categories");
      setProducts([]);
      fetchCategories(currentParent);
      return;
    }
    // Go up one level
    if (currentParent) {
      // Find parent of currentParent
      supabase
        .from("categories")
        .select("parent_id, name")
        .eq("id", currentParent)
        .single()
        .then(({ data }) => {
          if (data) {
            setCurrentParent(data.parent_id);
            setParentName(null);
            fetchCategories(data.parent_id);
          }
        });
    }
  };

  const handleSessionCreated = (qrcodeId: string, supplierCode: string) => {
    setActiveQrcodeId(qrcodeId);
    setActiveSupplierCode(supplierCode);
  };

  const hasSession = !!activeQrcodeId;
  const isTopLevel = !currentParent && viewMode === "categories";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isTopLevel && (
              <button onClick={goBack} className="text-muted-foreground hover:text-foreground p-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {parentName || "📋 Saisie Terrain"}
              </h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasSession && (
              <div className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">
                {activeSupplierCode}
              </div>
            )}
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground p-2">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* QR session CTA */}
        {isTopLevel && !hasSession && (
          <div className="p-4">
            <button
              onClick={() => setShowQRUpload(true)}
              className="w-full bg-primary text-primary-foreground rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-md"
            >
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <QrCode className="w-7 h-7" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-lg">Scanner le QR Code magasin</p>
                <p className="text-sm opacity-80">Photographiez le QR WeChat du fournisseur</p>
              </div>
            </button>
          </div>
        )}

        {/* My Products Today */}
        {isTopLevel && myProducts.length > 0 && (
          <div className="px-4 pb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Mes produits du jour ({myProducts.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {myProducts.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="bg-card border border-border rounded-xl overflow-hidden text-left active:scale-[0.97] transition-transform"
                >
                  {prod.image_url ? (
                    <img src={prod.image_url} alt={prod.name} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-medium text-foreground truncate">{prod.name}</p>
                    {prod.price && (
                      <p className="text-xs text-primary font-semibold">{Number(prod.price).toFixed(2)} €</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {viewMode === "categories" && !loadingCats && (
          <div className="p-4 grid grid-cols-2 gap-3">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => drillDown(cat)}
                className={`${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} text-white rounded-2xl p-6 text-left active:scale-[0.97] transition-transform shadow-md min-h-[100px] flex items-end`}
              >
                <span className="font-bold text-base leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {viewMode === "products" && !loadingProducts && (
          <div className="p-4">
            {products.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Aucun produit dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="bg-card border border-border rounded-xl overflow-hidden text-left active:scale-[0.97] transition-transform"
                  >
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground truncate">{prod.name}</p>
                      {prod.sell_price && (
                        <p className="text-xs text-primary font-semibold">{prod.sell_price.toFixed(2)} €</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(loadingCats || loadingProducts) && (
          <div className="text-center text-muted-foreground py-12">Chargement...</div>
        )}
      </div>

      {/* Floating add button */}
      {hasSession && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
        >
          <Camera className="w-7 h-7" />
        </button>
      )}

      {/* QR Upload */}
      {showQRUpload && (
        <WeChatQRUpload
          onSessionCreated={handleSessionCreated}
          onClose={() => setShowQRUpload(false)}
        />
      )}

      {/* Product Form */}
      {showForm && activeQrcodeId && (
        <TeamProductForm
          qrcodeId={activeQrcodeId}
          supplierCode={activeSupplierCode!}
          onClose={() => setShowForm(false)}
          onSaved={() => {}}
        />
      )}

      {/* Fiche Produit Modal (read-only for team) */}
      {selectedProduct && (
        <FicheProduit
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
};

export default Team;
