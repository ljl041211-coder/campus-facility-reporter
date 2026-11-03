// One shared formatter, e.g. "2 Nov 2026, 14:05" (UK date order).
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDate(timestamp) {
  return dateFormatter.format(timestamp)
}
