/**
 * Map settings shared by every map in the app.
 */

// UWS Paisley campus – the default view when there are no reports with a location yet.
export const CAMPUS_CENTRE = [55.8434, -4.4302]
export const CAMPUS_ZOOM = 17

// OpenStreetMap's standard tiles. The attribution is required by the OSM licence
// and is shown in the bottom-right corner of the map.
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
export const MAX_ZOOM = 19
