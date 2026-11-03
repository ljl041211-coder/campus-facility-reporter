// Accuracy worse than this (in metres) is shown with a warning.
export const LOW_ACCURACY_METRES = 100

/** Reads the saved location of a report, or null if it has none. */
export function getReportLocation(report) {
  if (report.latitude == null || report.longitude == null) return null
  return { latitude: report.latitude, longitude: report.longitude, accuracy: report.accuracy }
}

/** e.g. "55.84310, -4.43040" – 5 decimal places is about 1 metre. */
export function formatCoordinates(location) {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
}
