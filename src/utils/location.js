// Accuracy worse than this (in metres) is shown with a warning.
export const LOW_ACCURACY_METRES = 100

/**
 * Reads the saved location of a report, or null if it has none.
 * source: 'gps' (Geolocation API) or 'map' (set by hand on the map).
 * Reports saved before the map picker existed have no locationSource, so they count as GPS.
 */
export function getReportLocation(report) {
  if (report.latitude == null || report.longitude == null) return null
  return {
    latitude: report.latitude,
    longitude: report.longitude,
    accuracy: report.accuracy,
    source: report.locationSource ?? 'gps',
  }
}

/** e.g. "55.84310, -4.43040" – 5 decimal places is about 1 metre. */
export function formatCoordinates(location) {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
}

/** e.g. "set on the map" or "accurate to about 12 m". */
export function describeLocationSource(location) {
  if (location.source === 'map' || location.accuracy == null) return 'set on the map'
  return `accurate to about ${location.accuracy} m`
}
