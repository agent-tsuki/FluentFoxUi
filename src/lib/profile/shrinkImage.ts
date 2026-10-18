/**
 * Shrinks a photo in the browser before upload. Phone photos are often 4000px
 * and 5 MB; the API accepts up to 2 MB and keeps 512px, so sending ~1024px
 * makes the upload fast and keeps it under the limit.
 */
const TARGET_PX = 1024
const JPEG_QUALITY = 0.9
const OUTPUT_TYPE = 'image/jpeg'

export async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, TARGET_PX / Math.min(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    // JPEG has no transparency; fill white so transparent PNG areas don't turn black.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, OUTPUT_TYPE, JPEG_QUALITY))
    return blob ?? file
  } finally {
    bitmap.close()
  }
}
