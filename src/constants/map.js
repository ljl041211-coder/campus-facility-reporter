/**
 * Map settings shared by the campus map and the small map in the report form.
 */

export const CAMPUS_CENTRE = [55.8437, -4.43]

export const CAMPUS_ZOOM = 16 // whole campus
export const DETAIL_ZOOM = 18

// Map images ("tiles") come from OpenStreetMap. They need a network connection,
// and the attribution text must always be shown on the map.
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
export const TILE_MAX_ZOOM = 19
