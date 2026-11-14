import { STATUS, STATUS_LABELS } from '../constants/categories.js'

/**
 * Small label for a report's status. The status is shown with a symbol and
 * text as well as colour, so it does not depend on colour vision.
 */
export default function StatusBadge({ status }) {
  const symbol = status === STATUS.RESOLVED ? '✓' : '!'

  return (
    <span className={`badge badge--${status}`}>
      <span aria-hidden="true">{symbol}</span> {STATUS_LABELS[status] ?? status}
    </span>
  )
}
