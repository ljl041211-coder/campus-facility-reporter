import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  CAMPUS_CENTRE,
  CAMPUS_ZOOM,
  DETAIL_ZOOM,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_URL,
} from '../constants/map.js'
import { positionIcon } from '../utils/mapIcons.js'

/** Moves the map so the marker stays in the middle whenever the position changes. */
function FollowPosition({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      // animate: false avoids a Leaflet error if the form closes while the map is still moving.
      map.setView([position.latitude, position.longitude], Math.max(map.getZoom(), DETAIL_ZOOM), {
        animate: false,
      })
    }
  }, [map, position])

  return null
}

/** Listens for a tap on the map and reports where it was. */
function PlaceOnTap({ onPlace }) {
  useMapEvents({
    click: (event) => onPlace(event.latlng.lat, event.latlng.lng),
  })
  return null
}

/**
 * Small map in the report form. GPS can be ten metres or more off between
 * buildings, so the user can correct the position:
 *   - a position is known: drag the marker to the exact place
 *   - no position (for example permission denied): tap the map to place the marker
 * onMove(latitude, longitude) is called with the corrected position.
 */
export default function PositionMap({ position, onMove }) {
  const centre = position ? [position.latitude, position.longitude] : CAMPUS_CENTRE

  function handleDragEnd(event) {
    const { lat, lng } = event.target.getLatLng()
    onMove(lat, lng)
  }

  return (
    <>
      <MapContainer
        center={centre}
        zoom={position ? DETAIL_ZOOM : CAMPUS_ZOOM}
        className="map map--small"
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <FollowPosition position={position} />
        {position ? (
          <Marker
            position={centre}
            icon={positionIcon}
            draggable
            title="Position of the problem. Drag to correct it."
            eventHandlers={{ dragend: handleDragEnd }}
          />
        ) : (
          <PlaceOnTap onPlace={onMove} />
        )}
      </MapContainer>
      <p className="hint">
        {position
          ? 'Not quite right? Drag the marker to the exact place.'
          : 'Tap the map where the problem is to set the position by hand.'}
      </p>
    </>
  )
}
