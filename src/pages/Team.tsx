import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Camera, QrCode, Image, Package, Clock, Store, Plus } from "lucide-react";
import TeamProductForm from "@/components/TeamProductForm";
import WeChatQRUpload from "@/components/WeChatQRUpload";

interface RecentProduct {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  reference: string | null;
  created_at: string;
}

const Team = () => {
  const { user, signOut } = useAuth();
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQRUpload, setShowQRUpload] = useState(false);

  // Active session
  const [activeQrcodeId, setActiveQrcodeId] = useState<string | null>(null);
  const [activeSupplierCode, setActiveSupplierCode] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, image_url, category, reference, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setRecentProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSessionCreated = (qrcodeId: string, supplierCode: string) => {
    setActiveQrcodeId(qrcodeId);
    setActiveSupplierCode(supplierCode);
  };

  const endSession = () => {
    setActiveQrcodeId(null);
    setActiveSupplierCode(null);
  };

  const todayCount = recentProducts.filter((p) => {
    const today = new Date().toDateString();
    return new Date(p.created_at).toDateString() === today;
  }).length;

  const hasSession = !!activeQrcodeId;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">📋 Saisie Terrain</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Active session bar */}
      {hasSession && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Magasin actif</p>
              <p className="text-xs text-muted-foreground font-mono">{activeSupplierCode}</p>
            </div>
          </div>
          <button
            onClick={endSession}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            Changer de magasin
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Camera className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{todayCount}</p>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{recentProducts.length}</p>
            <p className="text-xs text-muted-foreground">Total produits</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            Chargement...
          </div>
        ) : (
          <>
            {/* Main CTA */}
            <div className="p-4">
              {!hasSession ? (
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
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-primary text-primary-foreground rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-md"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-lg">Ajouter un produit</p>
                    <p className="text-sm opacity-80">Photo + infos rapides</p>
                  </div>
                  <Plus className="w-6 h-6 opacity-60" />
                </button>
              )}
            </div>

            {/* Recent entries */}
            <div className="px-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Derniers ajouts
              </h2>
              {recentProducts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Aucun produit ajouté</p>
                  <p className="text-xs">Commencez par scanner un QR Code magasin !</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
                    >
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{prod.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {prod.category || "Sans catégorie"} · {new Date(prod.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating button */}
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
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
};

export default Team;
