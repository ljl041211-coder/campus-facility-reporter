import L from 'leaflet'
import { getCategory } from '../constants/categories.js'

/**
 * Map markers are built with L.divIcon: the marker is plain HTML + CSS instead
 * of Leaflet's default image pin. This avoids the well-known problem of the
 * default pin images going missing after Vite bundles the app, and step 5 can
 * swap in the animated cartoon markers in this one place.
 *
 * Open reports: a solid red pin. Resolved reports: a faded grey pin with a ✓
 * badge – so the status is shown by shape and symbol, not by colour alone.
 */

// Size of the pin in pixels. The anchor is the tip of the pin (bottom centre),
// so the tip – not the middle of the icon – sits on the reported spot.
const ICON_SIZE = [36, 44]
const ICON_ANCHOR = [18, 44]
const POPUP_ANCHOR = [0, -40]

// Icons are cached and reused. react-leaflet replaces a marker's icon whenever
// it receives a new icon object, so creating a fresh one on every render would
// redraw every marker for no reason.
const iconCache = new Map()

export function getReportIcon(categoryId, status) {
  const key = `${categoryId}-${status}`
  if (!iconCache.has(key)) {
    // Only our own constants go into the HTML, never text typed by the user.
    const emoji = getCategory(categoryId)?.emoji ?? '📍'
    const check = status === 'resolved' ? '<span class="report-marker__check">✓</span>' : ''

    iconCache.set(
      key,
      L.divIcon({
        className: `report-marker report-marker--${status}`,
        html: `<span class="report-marker__pin"><span class="report-marker__emoji">${emoji}</span></span>${check}`,
        iconSize: ICON_SIZE,
        iconAnchor: ICON_ANCHOR,
        popupAnchor: POPUP_ANCHOR,
      }),
    )
  }
  return iconCache.get(key)
}
