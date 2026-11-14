const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** Formats a timestamp (milliseconds) as e.g. "14 Nov 2026, 10:30". */
export function formatDateTime(timestamp) {
  return dateFormatter.format(timestamp)
}

/** Formats coordinates with 5 decimal places (about 1 metre of precision). */
export function formatCoordinates(latitude, longitude) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

/** Link that opens the position on OpenStreetMap with a marker. */
export function openStreetMapUrl(latitude, longitude) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=19/${latitude}/${longitude}`
}
