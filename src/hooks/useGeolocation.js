import { useCallback, useEffect, useRef, useState } from 'react'

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true, // ask for GPS rather than a rough network position
  timeout: 15000, // give up after 15 seconds
  maximumAge: 0, // always take a fresh reading, never a cached one
}

/**
 * The Geolocation API uses callbacks. Wrapping it in a Promise lets the rest of
 * the code handle success and failure in one place.
 */
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('unsupported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS)
  })
}

/** Turns a Geolocation error into a message the user can act on. */
function describeError(error) {
  // error.code: 1 = permission denied, 2 = position unavailable, 3 = timeout
  switch (error.code) {
    case 1:
      return 'Location permission was denied. Allow location access in your browser settings, or describe the place in the location note.'
    case 2:
      return 'Your position is not available right now. Move to an open area and try again.'
    case 3:
      return 'Finding your position took too long. Try again.'
    default:
      return 'This device or browser does not support location.'
  }
}

/**
 * Custom hook for reading the device position.
 *
 *   position  { latitude, longitude, accuracy } or null
 *   status    'idle' | 'locating' | 'error'
 *   error     message for the user, or null
 *   locate()  asks the device for the current position
 *
 * initialPosition: a position that is already known (when editing a report).
 * autoStart: ask for the position as soon as the component appears.
 */
export function useGeolocation({ initialPosition = null, autoStart = false } = {}) {
  const [position, setPosition] = useState(initialPosition)
  const [status, setStatus] = useState(autoStart ? 'locating' : 'idle')
  const [error, setError] = useState(null)

  // Each request gets a number. If a newer request has started, or the component
  // has gone, the answer of an older request is ignored.
  const latestRequest = useRef(0)

  const request = useCallback(() => {
    const requestNumber = ++latestRequest.current

    getCurrentPosition().then(
      (result) => {
        if (requestNumber !== latestRequest.current) return
        setPosition({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracy: Math.round(result.coords.accuracy),
        })
        setError(null)
        setStatus('idle')
      },
      (failure) => {
        if (requestNumber !== latestRequest.current) return
        setError(describeError(failure))
        setStatus('error')
      },
    )
  }, [])

  const locate = useCallback(() => {
    setStatus('locating')
    setError(null)
    request()
  }, [request])

  useEffect(() => {
    if (autoStart) request()
    // Cleanup: invalidate any request that is still running when the component goes away.
    return () => {
      latestRequest.current += 1
    }
  }, [autoStart, request])

  return { position, status, error, locate }
}
