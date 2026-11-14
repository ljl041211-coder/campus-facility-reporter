import { formatCoordinates } from '../utils/format.js'

// Above this many metres the GPS reading is too rough to find a street light or a bench.
const LOW_ACCURACY_METRES = 50

/**
 * Shows the state of the Geolocation request (finding, found, failed) and a
 * button to ask again. `geo` is the object returned by the useGeolocation hook.
 */
export default function LocationField({ geo }) {
  const { position, status, error, locate } = geo
  const locating = status === 'locating'

  return (
    <div className="location-field">
      {/* aria-live makes screen readers announce the result when it arrives */}
      <div aria-live="polite">
        {locating && <p>Finding your position…</p>}

        {!locating && position && (
          <p>
            <strong>{formatCoordinates(position.latitude, position.longitude)}</strong>
            <span className="location-field__accuracy">
              {' '}
              (accurate to about {position.accuracy} m)
            </span>
          </p>
        )}

        {!locating && !position && !error && <p>No location recorded yet.</p>}

        {!locating && position && position.accuracy > LOW_ACCURACY_METRES && (
          <p className="hint">
            The position is not very precise. Add a location note to help find the place.
          </p>
        )}

        {error && <p className="message message--error">{error}</p>}
      </div>

      <button
        type="button"
        className="button button--secondary"
        onClick={locate}
        disabled={locating}
      >
        {position ? 'Update location' : 'Get my location'}
      </button>
    </div>
  )
}
