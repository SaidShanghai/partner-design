import { useEffect, useState } from "react";
import { Package, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/lib/productImageUrl";

interface Props {
  url?: string | null;
  path?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
  fallbackIcon?: LucideIcon;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
}

const ProductImage = ({
  url,
  path,
  alt,
  className,
  iconClassName = "w-6 h-6",
  fallbackIcon: FallbackIcon = Package,
  loading,
  width,
  height,
}: Props) => {
  const [errored, setErrored] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  // When `path` is provided, resolve a signed URL via the helper.
  // When only `url` is provided, use it directly (legacy path used by
  // the 8 components patched in phase 1).
  useEffect(() => {
    setErrored(false);

    if (path) {
      let cancelled = false;
      getProductImageUrl(path).then((signed) => {
        if (!cancelled) {
          setResolvedUrl(signed);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    setResolvedUrl(null);
  }, [path, url]);

  // Effective source: path-resolved signed URL takes priority over url.
  const effectiveSrc = path ? resolvedUrl : url;

  if (!effectiveSrc || errored) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("bg-muted flex items-center justify-center shrink-0", className)}
      >
        <FallbackIcon className={cn("text-muted-foreground", iconClassName)} />
      </div>
    );
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      onError={() => setErrored(true)}
      className={cn("object-cover shrink-0", className)}
      loading={loading}
      width={width}
      height={height}
    />
  );
};

export default ProductImage;
