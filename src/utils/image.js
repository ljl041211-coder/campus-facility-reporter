// Longest side of a saved photo, in pixels. Big enough to see the damage,
// small enough (roughly 150–400 KB as JPEG) to store many photos on a phone.
const MAX_PHOTO_SIZE = 1280
const JPEG_QUALITY = 0.8

// canvas.toBlob uses a callback; wrap it in a Promise so we can use await.
function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be converted.'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

/**
 * Shrinks an image (a camera canvas or a chosen file) and returns a JPEG Blob.
 * A Blob is stored in IndexedDB as raw binary data, which is about a third
 * smaller than the same photo as a base64 text string.
 */
export async function resizeImage(source) {
  const bitmap = await createImageBitmap(source)
  const scale = Math.min(1, MAX_PHOTO_SIZE / Math.max(bitmap.width, bitmap.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return canvasToBlob(canvas)
}
