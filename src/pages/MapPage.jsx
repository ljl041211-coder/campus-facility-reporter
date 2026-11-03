import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import L from 'leaflet'
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import { db } from '../db.js'
import { getCategory, STATUSES } from '../constants/categories.js'
import { CAMPUS_CENTRE, CAMPUS_ZOOM, MAX_ZOOM, TILE_ATTRIBUTION, TILE_URL } from '../constants/map.js'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { getReportLocation } from '../utils/location.js'
import { getReportIcon } from '../utils/mapIcons.js'

const USER_COLOUR = '#1a73e8'

// When a popup opens, Leaflet pans the map so the popup fits on screen.
// This extra space at the top keeps it below the "Show my location" button.
const POPUP_PADDING_TOP_LEFT = [16, 76]

/**
 * Leaflet measures the map's size only once. When the map box changes size
 * (a notice appears above it, or the phone is rotated), invalidateSize() makes
 * Leaflet measure again; otherwise tiles and markers can end up in the wrong place.
 */
function MapResizeWatcher() {
  const map = useMap()

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  return null
}

/**
 * Shows the student's own position as a blue dot with a circle for the GPS
 * accuracy. It lives inside <MapContainer>, so useMap() can move the map there.
 */
function MyLocationLayer({ position }) {
  const map = useMap()

  // Fly to the new position each time the student asks for it.
  useEffect(() => {
    if (position) {
      map.flyTo([position.latitude, position.longitude], Math.max(map.getZoom(), CAMPUS_ZOOM))
    }
  }, [map, position])

  if (!position) return null
  const centre = [position.latitude, position.longitude]

  return (
    <>
      <Circle center={centre} radius={position.accuracy} pathOptions={{ color: USER_COLOUR, weight: 1, fillOpacity: 0.12 }} />
      <CircleMarker
        center={centre}
        radius={8}
        pathOptions={{ color: '#ffffff', weight: 3, fillColor: USER_COLOUR, fillOpacity: 1 }}
      >
        <Popup>You are here (accurate to about {position.accuracy} m)</Popup>
      </CircleMarker>
    </>
  )
}

/**
 * One report on the map: a marker that opens a popup with a short summary.
 */
function ReportMarker({ report, onOpenReport }) {
  const popupRef = useRef(null)
  const category = getCategory(report.category)
  const statusLabel = STATUSES[report.status]?.label ?? report.status

  // React fills in the popup only after Leaflet has opened (and measured) it,
  // so Leaflet thinks the popup is empty. Once our content is on screen, ask
  // the popup to measure itself again, so the map pans to show all of it.
  function handleContentShown(node) {
    if (node) popupRef.current?.update()
  }

  return (
    <Marker
      position={[report.latitude, report.longitude]}
      icon={getReportIcon(report.category, report.status)}
      // title is read by screen readers and shown on hover.
      title={`${category?.label ?? 'Report'} – ${statusLabel}`}
    >
      <Popup ref={popupRef} autoPanPaddingTopLeft={POPUP_PADDING_TOP_LEFT}>
        <div className="map-popup" ref={handleContentShown}>
          <p className="map-popup__title">
            <span aria-hidden="true">{category?.emoji ?? '📍'} </span>
            {category?.label ?? 'Other problem'}
          </p>
          <span className={`badge badge--${report.status}`}>{statusLabel}</span>
          <p className="map-popup__text">{report.description}</p>
          <button
            type="button"
            className="button button--primary map-popup__button"
            onClick={() => onOpenReport(report.id)}
          >
            View details
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

/**
 * The "Map" tab: every report that has a location is a marker on an
 * OpenStreetMap map. Tapping a marker shows a short summary and a link to
 * the report's details.
 */
export default function MapPage({ onOpenReport, onNavigate }) {
  // useLiveQuery: a new, edited or deleted report updates the markers by itself.
  const reports = useLiveQuery(() => db.reports.toArray(), [])
  const geo = useGeolocation()
  const [tilesFailed, setTilesFailed] = useState(false)

  if (reports === undefined) {
    return <p className="status-text">Loading map…</p>
  }

  const reportsOnMap = reports.filter((report) => getReportLocation(report))
  const missingCount = reports.length - reportsOnMap.length

  // First view: zoom to fit every marker, or show the campus if there are none.
  // MapContainer only reads these when it is created, so adding a report later
  // does not make the map jump.
  const initialView =
    reportsOnMap.length > 0
      ? {
          bounds: L.latLngBounds(reportsOnMap.map((report) => [report.latitude, report.longitude])),
          boundsOptions: { padding: [48, 48], maxZoom: CAMPUS_ZOOM },
        }
      : { center: CAMPUS_CENTRE, zoom: CAMPUS_ZOOM }

  return (
    <div className="map-page">
      {/* aria-live: screen readers announce these notices when they appear. */}
      <div className="map-notices" aria-live="polite">
        {tilesFailed && (
          <p className="map-notice map-notice--error">
            The map needs an internet connection. Your reports are still in{' '}
            <button type="button" className="link-button" onClick={() => onNavigate('list')}>
              My reports
            </button>
            .
          </p>
        )}
        {missingCount > 0 && (
          <p className="map-notice">
            {missingCount === 1 ? '1 report has' : `${missingCount} reports have`} no location and{' '}
            {missingCount === 1 ? 'is' : 'are'} not shown.{' '}
            <button type="button" className="link-button" onClick={() => onNavigate('list')}>
              See My reports
            </button>
          </p>
        )}
        {geo.status === 'error' && <p className="map-notice map-notice--error">{geo.errorMessage}</p>}
      </div>

      <div className="map-wrapper">
        {/* zoomControl={false} + <ZoomControl> moves the zoom buttons to the bottom,
            leaving the top of the map free for popups and the location button. */}
        <MapContainer {...initialView} maxZoom={MAX_ZOOM} zoomControl={false} className="map">
          <ZoomControl position="bottomleft" />
          <MapResizeWatcher />
          <TileLayer
            url={TILE_URL}
            attribution={TILE_ATTRIBUTION}
            maxZoom={MAX_ZOOM}
            // Tiles come from the internet. If they fail (offline), show a notice;
            // when a tile loads again, hide it.
            eventHandlers={{
              tileerror: () => setTilesFailed(true),
              tileload: () => setTilesFailed(false),
            }}
          />

          {reportsOnMap.map((report) => (
            <ReportMarker key={report.id} report={report} onOpenReport={onOpenReport} />
          ))}

          <MyLocationLayer position={geo.position} />
        </MapContainer>

        <button
          type="button"
          className="button button--secondary map-locate-button"
          onClick={geo.requestLocation}
          disabled={geo.status === 'loading'}
        >
          <span aria-hidden="true">◎ </span>
          {geo.status === 'loading' ? 'Locating…' : 'Show my location'}
        </button>
      </div>
    </div>
  )
}
