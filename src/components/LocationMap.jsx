import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { CAMPUS_CENTRE, CAMPUS_ZOOM, MAX_ZOOM, TILE_ATTRIBUTION, TILE_URL } from '../constants/map.js'
import { getReportIcon } from '../utils/mapIcons.js'

// Closer than the campus view, so a single spot is easy to see and adjust.
const SPOT_ZOOM = 18

/** Turns a Leaflet position into the app's location object, marked as set by hand. */
function toMapLocation({ lat, lng }) {
  return { latitude: lat, longitude: lng, accuracy: null, source: 'map' }
}

/** Tapping the map places the pin there (only when the map can be edited). */
function TapToPlace({ onChange }) {
  useMapEvents({
    click: (event) => onChange(toMapLocation(event.latlng)),
  })
  return null
}

/**
 * Keeps the pin in view: when the location changes (a new GPS position,
 * or the pin was dragged), the map pans to it.
 */
function FollowLocation({ location }) {
  const map = useMap()
  const latitude = location?.latitude
  const longitude = location?.longitude

  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.panTo([latitude, longitude])
    }
  }, [map, latitude, longitude])

  return null
}

/**
 * Small map showing one location. Used in two places:
 *   - Report form (with onChange): drag the pin or tap the map to set the
 *     location by hand, e.g. when GPS is off or not precise enough.
 *   - Report details (without onChange): read-only, just shows where it is.
 *
 * Props:
 *   location – { latitude, longitude, accuracy, source } or null
 *   category – category id, so the pin shows the right emoji
 *   onChange – optional; called with the new location
 */
export default function LocationMap({ location, category, onChange }) {
  const isEditable = Boolean(onChange)
  const position = location ? [location.latitude, location.longitude] : null

  return (
    <MapContainer
      center={position ?? CAMPUS_CENTRE}
      zoom={position ? SPOT_ZOOM : CAMPUS_ZOOM}
      maxZoom={MAX_ZOOM}
      // The map sits inside a scrolling page: don't let the mouse wheel zoom it by accident.
      scrollWheelZoom={false}
      className="location-map"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={MAX_ZOOM} />

      {position && (
        <Marker
          position={position}
          icon={getReportIcon(category, 'open')}
          title={isEditable ? 'Report location – drag to adjust' : 'Report location'}
          draggable={isEditable}
          eventHandlers={
            isEditable ? { dragend: (event) => onChange(toMapLocation(event.target.getLatLng())) } : undefined
          }
        />
      )}

      {isEditable && <TapToPlace onChange={onChange} />}
      <FollowLocation location={location} />
    </MapContainer>
  )
}
