import StatusBadge from './StatusBadge.jsx'
import { getCategory } from '../constants/categories.js'
import { formatDateTime } from '../utils/format.js'

/** One report in the list. The whole card is a button that opens the report. */
export default function ReportCard({ report, onOpen }) {
  const category = getCategory(report.category)

  return (
    <button type="button" className="report-card" onClick={() => onOpen(report.id)}>
      {report.thumbnail ? (
        <img src={report.thumbnail} alt="" className="report-card__thumbnail" />
      ) : (
        <span className="report-card__thumbnail report-card__thumbnail--empty" aria-hidden="true">
          {category.emoji}
        </span>
      )}

      <span className="report-card__body">
        <span className="report-card__title">{category.label}</span>
        <span className="report-card__text">{report.description}</span>
        <span className="report-card__meta">
          <span>{formatDateTime(report.createdAt)}</span>
          <StatusBadge status={report.status} />
        </span>
      </span>
    </button>
  )
}
