/**
 * Problem categories shown in the report form and used for the map markers.
 * Each category will get its own cartoon marker icon in a later step.
 */
export const CATEGORIES = [
  { id: 'lighting', label: 'Broken street light', emoji: '💡' },
  { id: 'pavement', label: 'Damaged pavement', emoji: '🚧' },
  { id: 'waste', label: 'Overflowing bin', emoji: '🗑️' },
  { id: 'furniture', label: 'Damaged seating or facility', emoji: '🪑' },
  { id: 'safety', label: 'Road safety hazard', emoji: '⚠️' },
  { id: 'accessibility', label: 'Blocked accessible ramp', emoji: '♿' },
]

export const STATUSES = {
  open: { label: 'Needs repair' },
  resolved: { label: 'Resolved' },
}

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id)
}
