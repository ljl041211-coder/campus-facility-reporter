import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import ReportCard from '../components/ReportCard.jsx'
import { STATUS, STATUS_LABELS } from '../constants/categories.js'
import { getAllReports } from '../db.js'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: STATUS.OPEN, label: STATUS_LABELS[STATUS.OPEN] },
  { id: STATUS.RESOLVED, label: STATUS_LABELS[STATUS.RESOLVED] },
]

/**
 * READ: lists every saved report, newest first.
 * useLiveQuery re-runs the query whenever the reports table changes, so the list
 * updates by itself after a report is created, edited or deleted.
 */
export default function ReportListPage({ onOpenReport, onCreate }) {
  const reports = useLiveQuery(getAllReports)
  const [filter, setFilter] = useState('all')

  // useLiveQuery returns undefined until IndexedDB has answered.
  if (reports === undefined) {
    return <p className="status-text">Loading reports…</p>
  }

  if (reports.length === 0) {
    return (
      <section className="empty-state">
        <p className="empty-state__title">No reports yet</p>
        <p>Spotted a broken light or a blocked ramp? Create your first report.</p>
        <button type="button" className="button button--primary" onClick={onCreate}>
          Create a report
        </button>
      </section>
    )
  }

  const visibleReports =
    filter === 'all' ? reports : reports.filter((report) => report.status === filter)

  function countFor(filterId) {
    if (filterId === 'all') return reports.length
    return reports.filter((report) => report.status === filterId).length
  }

  return (
    <>
      <div className="filter-bar" role="group" aria-label="Filter reports by status">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            className="filter-bar__button"
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
          >
            {option.label} ({countFor(option.id)})
          </button>
        ))}
      </div>

      {visibleReports.length === 0 ? (
        <p className="status-text">No reports with this status.</p>
      ) : (
        <ul className="report-list">
          {visibleReports.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} onOpen={onOpenReport} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
