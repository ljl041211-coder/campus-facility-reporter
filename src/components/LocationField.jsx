import { useId, useState } from 'react'
import LocationMap from './LocationMap.jsx'
import { describeLocationSource, formatCoordinates, LOW_ACCURACY_METRES } from '../utils/location.js'

/**
 * The optional location part of the report form.
 * Two ways to set the location:
 *   1. GPS – the Geolocation API (called by the useGeolocation hook in ReportForm)
 *   2. By hand – drag the pin or tap the small map, e.g. when GPS is off,
 *      permission was denied, or the position is not precise enough
 *
 * Props:
 *   location     – { latitude, longitude, accuracy, source } or null
 *   category     – chosen category id, so the pin shows the right emoji
 *   status       – 'idle' | 'loading' | 'success' | 'error' (from useGeolocation)
 *   errorMessage – shown when status is 'error'
 *   onRequest    – asks for the current GPS position (again)
 *   onChange     – sets the location by hand (or null to remove it)
 */
export default function LocationField({ location, category, status, errorMessage, onRequest, onChange, disabled }) {
  const id = useId()
  const [isMapOpen, setIsMapOpen] = useState(false)
  const isLoading = status === 'loading'
  // Show the map whenever there is a pin to adjust, or the student asked for it.
  const showMap = Boolean(location) || isMapOpen

  function handleRemove() {
    onChange(null)
    setIsMapOpen(false)
  }

  return (
    <div className="form-field" role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className="form-label">
        Location (optional)
      </span>

      {/* aria-live: screen readers announce when the location is found or fails. */}
      <div aria-live="polite">
        {isLoading && <p className="status-text">Finding your location…</p>}

        {location && (
          <p className="location-box">
            <span aria-hidden="true">📍 </span>
            {formatCoordinates(location)}
            <span className="location-box__accuracy"> · {describeLocationSource(location)}</span>
          </p>
        )}

        {location?.source === 'gps' && location.accuracy > LOW_ACCURACY_METRES && (
          <p className="form-hint">This location is not very precise. Drag the pin to the right spot or add a location note.</p>
        )}

        {!isLoading && !location && status !== 'error' && <p className="form-hint">No location recorded yet.</p>}

        {status === 'error' && <p className="field-error">{errorMessage}</p>}
      </div>

      {showMap && (
        <>
          <p className="form-hint">
            {location ? 'Drag the pin, or tap the map, to adjust the spot.' : 'Tap the map to place the pin.'}
          </p>
          <LocationMap location={location} category={category} onChange={onChange} />
        </>
      )}

      <div className="button-row">
        <button type="button" className="button button--secondary" onClick={onRequest} disabled={disabled || isLoading}>
          {status === 'error' ? 'Try GPS again' : location ? 'Use my current location' : 'Use GPS'}
        </button>

        {!showMap && (
          <button type="button" className="button button--secondary" onClick={() => setIsMapOpen(true)} disabled={disabled}>
            Set on map
          </button>
        )}

        {location && (
          <button type="button" className="button button--danger-outline" onClick={handleRemove} disabled={disabled}>
            Remove location
          </button>
        )}
      </div>
    </div>
  )
}
