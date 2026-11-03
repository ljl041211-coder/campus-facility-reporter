import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'
import { getCategory, STATUSES } from '../constants/categories.js'
import { formatDate } from '../utils/formatDate.js'

/**
 * READ: lists every saved report, newest first.
 * useLiveQuery re-runs the query whenever the reports table changes, so the list
 * updates by itself after a report is created, edited or deleted.
 * Tapping a report opens its detail screen.
 */
export default function ReportListPage({ onNavigate, onOpenReport }) {
  const reports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray(), [])

  // useLiveQuery returns undefined until IndexedDB has answered.
  if (reports === undefined) {
    return <p className="status-text">Loading reports…</p>
  }

  if (reports.length === 0) {
    return (
      <section className="empty-state">
        <p className="empty-state__title">No reports yet</p>
        <p>Spotted a broken light or a blocked ramp? Create your first report.</p>
        <button type="button" className="button button--primary" onClick={() => onNavigate('new')}>
          Create a report
        </button>
      </section>
    )
  }

  return (
    <ul className="report-list">
      {reports.map((report) => {
        const category = getCategory(report.category)
        const status = STATUSES[report.status]
        return (
          <li key={report.id}>
            {/* A real <button>, so the card works with keyboard and screen readers too. */}
            <button type="button" className="report-card" onClick={() => onOpenReport(report.id)}>
              <span className="report-card__icon" aria-hidden="true">
                {category?.emoji ?? '📍'}
              </span>
              <span className="report-card__body">
                <span className="report-card__title">{category?.label ?? 'Other problem'}</span>
                {report.description && <span className="report-card__text">{report.description}</span>}
                <span className="report-card__meta">
                  {formatDate(report.createdAt)}
                  <span className={`badge badge--${report.status}`}>{status?.label ?? report.status}</span>
                </span>
              </span>
              <span className="report-card__chevron" aria-hidden="true">
                ›
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
