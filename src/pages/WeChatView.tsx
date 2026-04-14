import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QrCode, AlertCircle, Loader2 } from "lucide-react";

const WeChatView = () => {
  const { supplierCode } = useParams<{ supplierCode: string }>();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierCode) {
      setError("Code manquant");
      setLoading(false);
      return;
    }

    const fetchQR = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/wechat-view?code=${encodeURIComponent(supplierCode)}`,
          {
            headers: {
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Ce lien a expiré ou n'existe pas");
        } else {
          setQrUrl(data.url);
          setExpiresAt(data.expires_at);
        }
      } catch {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [supplierCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Lien invalide</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-primary mb-2">
          <QrCode className="w-6 h-6" />
          <h1 className="text-lg font-bold">WeChat QR Code</h1>
        </div>

        {qrUrl && (
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <img
              src={qrUrl}
              alt="WeChat QR Code"
              className="w-full aspect-square object-contain"
            />
          </div>
        )}

        {expiresAt && (
          <p className="text-xs text-muted-foreground">
            ⏳ Expire le {new Date(expiresAt).toLocaleString("fr-FR")}
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          Scannez ce QR code avec WeChat pour contacter le fournisseur.
        </p>
      </div>
    </div>
  );
};

export default WeChatView;
