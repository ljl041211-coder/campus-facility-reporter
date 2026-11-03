import { useCallback, useEffect, useState } from 'react'

// enableHighAccuracy: ask for GPS rather than a rough Wi-Fi/network position.
// timeout: give up after 15 seconds instead of waiting forever.
// maximumAge: a position from the last minute is good enough, and much faster.
const OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000,
}

// Turns the browser's error codes into messages a student can act on.
function describeError(error) {
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return 'Location permission was denied. To allow it, open your browser or phone settings for this site. You can still set the spot on the map or describe it in the location note.'
    case 2: // POSITION_UNAVAILABLE
      return 'Your location could not be found. Check that location services are turned on for your browser, or move outdoors and try again. You can also set the spot on the map.'
    case 3: // TIMEOUT
      return 'Finding your location took too long. Please try again.'
    default:
      return 'Your location could not be found. Please try again.'
  }
}

/**
 * Custom hook around the Geolocation API.
 *
 * Returns { status, position, errorMessage, requestLocation }
 *   status    – 'idle' | 'loading' | 'success' | 'error'
 *   position  – { latitude, longitude, accuracy } from the last success, otherwise null
 *   requestLocation – call this to ask for the position (again)
 *
 * With { requestOnMount: true } it asks as soon as the component appears,
 * so a new report records its location automatically.
 */
export function useGeolocation({ requestOnMount = false } = {}) {
  const [state, setState] = useState({ status: 'idle', position: null, errorMessage: '' })

  const requestLocation = useCallback(() => {
    // Browsers only allow geolocation on HTTPS pages (and localhost).
    if (!window.isSecureContext) {
      setState({
        status: 'error',
        position: null,
        errorMessage: 'Location needs a secure (HTTPS) connection. Open the app from its https:// address.',
      })
      return
    }
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', position: null, errorMessage: 'This browser cannot share your location.' })
      return
    }

    setState((previous) => ({ ...previous, status: 'loading', errorMessage: '' }))

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setState({
          status: 'success',
          position: {
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
            accuracy: Math.round(result.coords.accuracy), // in metres
          },
          errorMessage: '',
        })
      },
      (error) => {
        // Keep any position found earlier, so a failed "update" does not lose it.
        setState((previous) => ({ ...previous, status: 'error', errorMessage: describeError(error) }))
      },
      OPTIONS,
    )
  }, [])

  useEffect(() => {
    if (requestOnMount) requestLocation()
  }, [requestOnMount, requestLocation])

  return { ...state, requestLocation }
}
