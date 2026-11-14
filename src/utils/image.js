/**
 * Image helpers. Photos are handled as JPEG "data URLs" (a base64 string that
 * starts with "data:image/jpeg;base64,"), the same format react-webcam returns.
 */

/** Reads a file chosen with <input type="file"> and returns it as a data URL. */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('The selected file could not be read.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Scales an image down so its longest side is at most `maxSize` pixels and
 * returns it as a JPEG data URL. Used for two things:
 *  - shrinking large photos picked from the gallery before they are stored
 *  - making the small thumbnail shown in the report list
 * An image that is already small enough is only re-encoded, never enlarged.
 */
export function resizeImage(dataUrl, maxSize, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    image.onerror = () => reject(new Error('The image could not be processed.'))
    image.src = dataUrl
  })
}
