import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, Upload, Copy, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  subcategoryId: string;
  subcategoryName: string;
  onClose: () => void;
}

const WeChatQRUpload = ({ subcategoryId, subcategoryName, onClose }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [supplierCode, setSupplierCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const generateSupplierCode = () => {
    const uuid = crypto.randomUUID().split("-")[0];
    return `SUP-${uuid}`;
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const code = generateSupplierCode();
      const ext = file.name.split(".").pop() || "png";
      const path = `${code}.${ext}`;

      // Upload to private bucket
      const { error: uploadErr } = await supabase.storage
        .from("wechat-qrcodes")
        .upload(path, file);
      if (uploadErr) throw uploadErr;

      // Insert record
      const { error: insertErr } = await supabase.from("wechat_qrcodes").insert({
        subcategory_id: subcategoryId,
        supplier_code: code,
        image_path: path,
      });
      if (insertErr) {
        // Clean up uploaded file on error
        await supabase.storage.from("wechat-qrcodes").remove([path]);
        throw insertErr;
      }

      setSupplierCode(code);
      toast.success("QR Code uploadé avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const copyCode = async () => {
    if (!supplierCode) return;
    const shareUrl = `${window.location.origin}/wechat/${supplierCode}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="text-muted-foreground">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-foreground">WeChat QR Code</h2>
        <div className="w-6" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">📦 {subcategoryName}</p>
          <p>Uploadez le QR Code WeChat du fournisseur. Un lien unique sera généré, valable 72h.</p>
        </div>

        {!supplierCode ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-square max-w-[280px] mx-auto rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 overflow-hidden"
            >
              {preview ? (
                <img src={preview} alt="QR Preview" className="w-full h-full object-contain p-4" />
              ) : (
                <>
                  <QrCode className="w-16 h-16 text-muted-foreground mb-3" />
                  <span className="text-muted-foreground text-sm">Prendre une photo du QR Code</span>
                </>
              )}
            </button>

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Uploader le QR Code
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
              <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-foreground text-lg mb-1">QR Code enregistré !</p>
              <p className="text-sm text-muted-foreground">Partagez le lien ci-dessous avec le fournisseur</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Lien de partage</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm font-mono text-foreground break-all">
                  {window.location.origin}/wechat/{supplierCode}
                </code>
                <button
                  onClick={copyCode}
                  className="shrink-0 w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">⏳ Expire dans 72 heures</p>
            </div>

            <button
              onClick={onClose}
              className="w-full h-12 rounded-xl border border-border text-foreground font-medium"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeChatQRUpload;
