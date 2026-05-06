import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a signed URL for a product image stored in the private
 * `product-images` bucket. Mirrors the pattern used for wechat-qrcodes.
 *
 * @param path - Relative path within the bucket (e.g. "team/abc_123.jpg")
 * @returns A signed URL valid for 1 hour, or null if generation fails
 */

const SIGNED_URL_TTL_SECONDS = 3600;

// In-memory cache keyed by path. Each entry stores the URL and the
// timestamp at which it expires (slightly before the TTL to be safe).
interface CacheEntry {
  url: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// Refresh URLs 5 minutes before they actually expire, to avoid a flicker
// when a user lingers on a page longer than the TTL.
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export async function getProductImageUrl(
  path: string | null | undefined
): Promise<string | null> {
  if (!path) return null;

  const now = Date.now();
  const cached = cache.get(path);
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    // Storage object missing, RLS denied, or network error — caller
    // should render the fallback (Package icon).
    return null;
  }

  cache.set(path, {
    url: data.signedUrl,
    expiresAt: now + SIGNED_URL_TTL_SECONDS * 1000 - REFRESH_MARGIN_MS,
  });

  return data.signedUrl;
}

/**
 * Clears the cache. Useful for testing or after a logout.
 */
export function clearProductImageUrlCache(): void {
  cache.clear();
}
