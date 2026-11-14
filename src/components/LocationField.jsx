import PositionMap from './PositionMap.jsx'
import { formatAccuracy, formatCoordinates } from '../utils/format.js'

// Above this many metres the GPS reading is too rough to find a street light or a bench.
const LOW_ACCURACY_METRES = 50

/**
 * Shows the state of the Geolocation request (finding, found, failed), a button
 * to ask again, and a small map for correcting the position by hand.
 * `geo` is the object returned by the useGeolocation hook.
 */
export default function LocationField({ geo }) {
  const { position, status, error, locate, setManualPosition } = geo
  const locating = status === 'locating'

  return (
    <div className="location-field">
      {/* aria-live makes screen readers announce the result when it arrives */}
      <div aria-live="polite">
        {locating && <p>Finding your position…</p>}

        {!locating && position && (
          <p>
            <strong>{formatCoordinates(position.latitude, position.longitude)}</strong>
            <span className="location-field__accuracy"> ({formatAccuracy(position.accuracy)})</span>
          </p>
        )}

        {!locating && !position && !error && <p>No location recorded yet.</p>}

        {!locating && position && position.accuracy > LOW_ACCURACY_METRES && (
          <p className="hint">
            The position is not very precise. Drag the marker or add a location note to help find
            the place.
          </p>
        )}

        {error && <p className="message message--error">{error}</p>}
      </div>

      {/* While the first GPS answer is still on its way there is nothing to show on the map yet. */}
      {(position || !locating) && <PositionMap position={position} onMove={setManualPosition} />}

      <button
        type="button"
        className="button button--secondary"
        onClick={locate}
        disabled={locating}
      >
        {position ? 'Use my current location' : 'Get my location'}
      </button>
    </div>
  )
}
