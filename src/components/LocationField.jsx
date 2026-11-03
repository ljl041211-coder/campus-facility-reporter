import { useId } from 'react'
import { formatCoordinates, LOW_ACCURACY_METRES } from '../utils/location.js'

/**
 * The optional location part of the report form. It only displays things:
 * the Geolocation API is called by the useGeolocation hook in ReportForm.
 *
 * Props:
 *   location     – { latitude, longitude, accuracy } or null
 *   status       – 'idle' | 'loading' | 'success' | 'error' (from useGeolocation)
 *   errorMessage – shown when status is 'error'
 *   onRequest    – asks for the current position (again)
 */
export default function LocationField({ location, status, errorMessage, onRequest, disabled }) {
  const id = useId()
  const isLoading = status === 'loading'

  return (
    <div className="form-field" role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className="form-label">
        Location (optional)
      </span>

      {/* aria-live: screen readers announce when the location is found or fails. */}
      <div aria-live="polite">
        {isLoading && <p className="status-text">Finding your location…</p>}

        {!isLoading && location && (
          <p className="location-box">
            <span aria-hidden="true">📍 </span>
            {formatCoordinates(location)}
            <span className="location-box__accuracy"> · accurate to about {location.accuracy} m</span>
          </p>
        )}

        {!isLoading && location?.accuracy > LOW_ACCURACY_METRES && (
          <p className="form-hint">This location is not very precise. Adding a location note will help.</p>
        )}

        {!isLoading && !location && status !== 'error' && <p className="form-hint">No location recorded yet.</p>}

        {status === 'error' && <p className="field-error">{errorMessage}</p>}
      </div>

      <div className="button-row">
        <button type="button" className="button button--secondary" onClick={onRequest} disabled={disabled || isLoading}>
          {status === 'error' ? 'Try again' : location ? 'Update to my current location' : 'Use my current location'}
        </button>
      </div>
    </div>
  )
}
