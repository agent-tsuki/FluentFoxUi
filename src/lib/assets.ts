import manifest from '@/lib/assetManifest.json'
import { CDN_BASE } from '@/lib/config'

/** `public/` path -> hashed R2 key, written by the upload script after a successful upload. */
const hashedKeys: Readonly<Record<string, string>> = manifest

/**
 * URL for a file that lives in `public/`. With a CDN configured and the file
 * uploaded, it points at the hashed, year-cached WebP copy in R2; otherwise the
 * bundled path is used, so dev and previews keep working. Anything that is not
 * a known public path (an OAuth avatar URL, say) passes through unchanged.
 */
export function asset(path: string): string {
  const key = hashedKeys[path]
  return CDN_BASE && key ? `${CDN_BASE}/${key}` : path
}
