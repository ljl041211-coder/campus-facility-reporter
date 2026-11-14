
export const CATEGORIES = [
  { id: 'lighting', label: 'Broken street light', emoji: '💡' },
  { id: 'pavement', label: 'Damaged pavement', emoji: '🚧' },
  { id: 'waste', label: 'Overflowing bin', emoji: '🗑️' },
  { id: 'furniture', label: 'Damaged seating or facility', emoji: '🪑' },
  { id: 'safety', label: 'Road safety hazard', emoji: '⚠️' },
  { id: 'accessibility', label: 'Blocked accessible ramp', emoji: '♿' },
]

/** A report is either waiting for repair or has been fixed. */
export const STATUS = {
  OPEN: 'open',
  RESOLVED: 'resolved',
}

export const STATUS_LABELS = {
  [STATUS.OPEN]: 'Needs repair',
  [STATUS.RESOLVED]: 'Resolved',
}

/** Looks up a category by id. Falls back to a generic one for unknown ids. */
export function getCategory(id) {
  return (
    CATEGORIES.find((category) => category.id === id) ?? {
      id: 'other',
      label: 'Other problem',
      emoji: '📍',
    }
  )
}
