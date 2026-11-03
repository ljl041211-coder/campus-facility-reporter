import { useEffect, useState } from 'react'

/**
 * Turns a photo Blob (from IndexedDB or the camera) into a URL an <img> can show.
 *
 * URL.createObjectURL keeps the image in memory until the URL is revoked,
 * so the cleanup function revokes it when the photo changes or the
 * component disappears. Without this, every viewed photo would leak memory.
 */
export function usePhotoUrl(blob) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  return url
}
