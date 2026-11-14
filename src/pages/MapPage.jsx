import { useEffect, useMemo, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import StatusBadge from '../components/StatusBadge.jsx'
import { getCategory, STATUS, STATUS_LABELS } from '../constants/categories.js'
import {
  CAMPUS_CENTRE,
  CAMPUS_ZOOM,
  DETAIL_ZOOM,
  TILE_ATTRIBUTION,
  TILE_MAX_ZOOM,
  TILE_URL,
} from '../constants/map.js'
import { getAllReports } from '../db.js'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'
import { getReportIcon } from '../utils/mapIcons.js'

/**
 * Chooses what the map shows: the one report the user asked for, or an area
 * that contains every marker. It draws nothing itself.
 */
function FitToReports({ reports, focusReport }) {
  const map = useMap()

  useEffect(() => {
    // animate: false jumps straight to the new view. A zoom animation that is
    // still running when the user switches to another tab makes Leaflet throw
    // an error, because the map it wants to move has already been removed.
    if (focusReport) {
      map.setView([focusReport.latitude, focusReport.longitude], DETAIL_ZOOM, { animate: false })
    } else if (reports.length > 0) {
      const positions = reports.map((report) => [report.latitude, report.longitude])
      map.fitBounds(positions, { padding: [48, 48], maxZoom: DETAIL_ZOOM, animate: false })
    }
  }, [map, reports, focusReport])

  return null
}

/** One report on the map. Tapping the marker opens a popup with a summary. */
function ReportMarker({ report, focused, onOpenReport }) {
  const markerRef = useRef(null)
  const category = getCategory(report.category)

  // Open the popup straight away for the report chosen with "Show on map".
  useEffect(() => {
    if (focused) markerRef.current?.openPopup()
  }, [focused])

  return (
    <Marker
      ref={markerRef}
      position={[report.latitude, report.longitude]}
      icon={getReportIcon(report.category, report.status)}
      title={`${category.label} – ${STATUS_LABELS[report.status]}`}
    >
      <Popup>
        <div className="map-popup">
          {report.thumbnail && <img src={report.thumbnail} alt="" className="map-popup__photo" />}
          <p className="map-popup__title">{category.label}</p>
          <StatusBadge status={report.status} />
          <p className="map-popup__text">{report.description}</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onOpenReport(report.id)}
          >
            View report
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapPage({ focusReportId, onOpenReport }) {
  const reports = useLiveQuery(getAllReports)
  const online = useOnlineStatus()

  // Only reports with a position can be drawn. useMemo keeps the same array
  // until the saved reports really change, so the map view is not reset every
  // time this component re-renders (for example when the connection drops).
  const locatedReports = useMemo(
    () => (reports ?? []).filter((report) => report.latitude != null),
    [reports],
  )
  const focusReport = useMemo(
    () => locatedReports.find((report) => report.id === focusReportId) ?? null,
    [locatedReports, focusReportId],
  )

  // useLiveQuery returns undefined until IndexedDB has answered.
  if (reports === undefined) {
    return <p className="status-text">Loading map…</p>
  }

  const withoutPosition = reports.length - locatedReports.length
  const openCount = locatedReports.filter((report) => report.status === STATUS.OPEN).length
  const resolvedCount = locatedReports.length - openCount

  return (
    <div className="map-page">
      {!online && (
        <p className="message message--info" role="status">
          You are offline, so the map background cannot load. Your reports are still saved and
          listed under My reports.
        </p>
      )}

      <MapContainer center={CAMPUS_CENTRE} zoom={CAMPUS_ZOOM} className="map map--full">
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />
        <FitToReports reports={locatedReports} focusReport={focusReport} />
        {locatedReports.map((report) => (
          <ReportMarker
            key={report.id}
            report={report}
            focused={report.id === focusReportId}
            onOpenReport={onOpenReport}
          />
        ))}
      </MapContainer>

      <p className="hint">
        {locatedReports.length === 0
          ? 'No reports with a position yet. New reports will appear here as markers.'
          : `On the map: ${openCount} needing repair, ${resolvedCount} resolved (grey marker with a tick).`}
        {withoutPosition > 0 &&
          ` ${withoutPosition} without a position ${withoutPosition === 1 ? 'is' : 'are'} only in the list.`}
      </p>
    </div>
  )
}
