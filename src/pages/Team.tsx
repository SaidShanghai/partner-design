import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Camera, QrCode, Package, FolderOpen, ArrowLeft, Trash2 } from "lucide-react";
import TeamProductForm from "@/components/TeamProductForm";
import WeChatQRUpload from "@/components/WeChatQRUpload";
import FicheProduit from "@/components/FicheProduit";

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
  status: string;
}

const Team = () => {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<"home" | "travaux">("home");
  const [myProducts, setMyProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);

  // Session state
  const [showForm, setShowForm] = useState(false);
  const [showQRUpload, setShowQRUpload] = useState(false);
  const [activeQrcodeId, setActiveQrcodeId] = useState<string | null>(null);
  const [activeSupplierCode, setActiveSupplierCode] = useState<string | null>(null);

  const fetchMyProducts = async () => {
    if (!user) return;
    setLoadingProducts(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("created_by", user.id)
      .in("status", ["brouillon", "en_traitement"])
      .order("created_at", { ascending: false });
    setMyProducts((data as unknown as ProductRow[]) || []);
    setLoadingProducts(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase.from("products").delete().eq("id", productId);
    setMyProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  useEffect(() => {
    fetchMyProducts();
  }, [user]);

  const handleSessionCreated = (qrcodeId: string, supplierCode: string) => {
    setActiveQrcodeId(qrcodeId);
    setActiveSupplierCode(supplierCode);
    setShowQRUpload(false);
    setShowForm(true);
  };

  const hasSession = !!activeQrcodeId;

  if (view === "travaux") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setView("home")} className="text-muted-foreground hover:text-foreground p-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">🚧 Travaux</h1>
            </div>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground p-2">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {loadingProducts ? (
            <div className="text-center text-muted-foreground py-12">Chargement...</div>
          ) : myProducts.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Aucun dossier en attente</p>
              <p className="text-xs mt-1">Tous vos produits ont été validés 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="w-full flex items-center gap-3 p-3 border border-border rounded-xl bg-card"
                >
                  <div className="flex-1 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                    {prod.image_url ? (
                      <img src={prod.image_url} alt={prod.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{prod.name}</p>
                      {prod.reference && <p className="text-xs font-mono text-primary">{prod.reference}</p>}
                      <p className="text-xs text-muted-foreground">
                        {prod.category || "Sans catégorie"} • {new Date(prod.created_at).toLocaleDateString("fr")}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      prod.status === "brouillon" ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"
                    }`}>
                      {prod.status === "brouillon" ? "Brouillon" : "En traitement"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 text-red-400 hover:text-red-600 active:scale-90 transition shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProduct && (
          <FicheProduit
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onUpdated={fetchMyProducts}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">📋 Saisie Terrain</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Scanner QR */}
        <button
          onClick={() => setShowQRUpload(true)}
          className="w-full bg-primary text-primary-foreground rounded-2xl p-6 flex items-center gap-4 active:scale-[0.97] transition-transform shadow-lg"
        >
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <QrCode className="w-8 h-8" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-lg">Scanner le QR Code</p>
            <p className="text-sm opacity-80">Photographiez le QR WeChat du fournisseur</p>
          </div>
        </button>

        {/* Travaux */}
        <button
          onClick={() => { setView("travaux"); fetchMyProducts(); }}
          className="w-full bg-card border-2 border-border rounded-2xl p-6 flex items-center gap-4 active:scale-[0.97] transition-transform shadow-md"
        >
          <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <FolderOpen className="w-8 h-8 text-amber-600" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-lg text-foreground">🚧 Travaux</p>
            <p className="text-sm text-muted-foreground">Vos dossiers en attente de validation</p>
          </div>
          {myProducts.length > 0 && (
            <span className="bg-amber-500 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">
              {myProducts.length}
            </span>
          )}
        </button>
      </div>

      {/* Floating add button when session active */}
      {hasSession && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
        >
          <Camera className="w-7 h-7" />
        </button>
      )}

      {showQRUpload && (
        <WeChatQRUpload
          onSessionCreated={handleSessionCreated}
          onClose={() => setShowQRUpload(false)}
        />
      )}

      {showForm && activeQrcodeId && (
        <TeamProductForm
          qrcodeId={activeQrcodeId}
          supplierCode={activeSupplierCode!}
          onClose={() => setShowForm(false)}
          onSaved={() => fetchMyProducts()}
          onFinishSession={() => {
            setShowForm(false);
            setActiveQrcodeId(null);
            setActiveSupplierCode(null);
          }}
        />
      )}
    </div>
  );
};

export default Team;
