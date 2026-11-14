import L from 'leaflet'
import { getCategory, STATUS } from '../constants/categories.js'

const PIN_SIZE = [40, 44]
const PIN_ANCHOR = [20, 41] // the tip of the pin, which sits on the exact position
const POPUP_ANCHOR = [0, -38] // the popup opens just above the pin

// One icon per category and status is enough, so they are created once and reused.
const iconCache = new Map()

/** Marker for a report: the category emoji in a pin. Resolved reports are grey with a tick. */
export function getReportIcon(categoryId, status) {
  const key = `${categoryId}-${status}`

  if (!iconCache.has(key)) {
    const category = getCategory(categoryId)
    const tick = status === STATUS.RESOLVED ? '<span class="map-pin__tick">✓</span>' : ''

    iconCache.set(
      key,
      L.divIcon({
        className: `map-pin map-pin--${status}`,
        html: `<span class="map-pin__shape"></span><span class="map-pin__emoji">${category.emoji}</span>${tick}`,
        iconSize: PIN_SIZE,
        iconAnchor: PIN_ANCHOR,
        popupAnchor: POPUP_ANCHOR,
      }),
    )
  }

  return iconCache.get(key)
}

/** Plain marker used in the report form, where the user drags it to the right place. */
export const positionIcon = L.divIcon({
  className: 'map-pin map-pin--position',
  html: '<span class="map-pin__shape"></span><span class="map-pin__dot"></span>',
  iconSize: PIN_SIZE,
  iconAnchor: PIN_ANCHOR,
})
