import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { getCategory, STATUS } from '../constants/categories.js'
import { deleteReport, getPhoto, getReport, setReportStatus } from '../db.js'
import { formatCoordinates, formatDateTime, openStreetMapUrl } from '../utils/format.js'

/**
 * READ one report in full, with the actions that change it:
 * UPDATE (mark as resolved / reopen, or open the edit form) and DELETE.
 */
export default function ReportDetailPage({ reportId, onEdit, onDeleted }) {
  const report = useLiveQuery(() => getReport(reportId), [reportId])
  const photo = useLiveQuery(() => getPhoto(reportId), [reportId])
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (report === undefined || deleting) {
    return <p className="status-text">Loading report…</p>
  }

  if (report === null) {
    return <p className="status-text">This report no longer exists.</p>
  }

  const category = getCategory(report.category)
  const resolved = report.status === STATUS.RESOLVED
  const hasPosition = report.latitude != null

  function handleToggleStatus() {
    setReportStatus(reportId, resolved ? STATUS.OPEN : STATUS.RESOLVED)
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteReport(reportId)
    onDeleted()
  }

  return (
    <article className="report-detail">
      {photo ? (
        <img src={photo} alt={`Photo of the reported problem: ${category.label}`} className="photo" />
      ) : (
        <p className="photo photo--empty">{photo === undefined ? 'Loading photo…' : 'No photo'}</p>
      )}

      <header className="report-detail__header">
        <h2 className="report-detail__title">
          <span aria-hidden="true">{category.emoji}</span> {category.label}
        </h2>
        <StatusBadge status={report.status} />
      </header>

      <p className="report-detail__description">{report.description}</p>

      <dl className="detail-list">
        <dt>Location</dt>
        <dd>
          {hasPosition ? (
            <>
              {formatCoordinates(report.latitude, report.longitude)} (about ±{report.accuracy} m)
              <br />
              <a
                href={openStreetMapUrl(report.latitude, report.longitude)}
                target="_blank"
                rel="noreferrer"
              >
                Open in OpenStreetMap
              </a>
            </>
          ) : (
            'No position recorded'
          )}
        </dd>

        {report.locationNote && (
          <>
            <dt>Location note</dt>
            <dd>{report.locationNote}</dd>
          </>
        )}

        <dt>Reported</dt>
        <dd>{formatDateTime(report.createdAt)}</dd>

        {report.updatedAt !== report.createdAt && (
          <>
            <dt>Last updated</dt>
            <dd>{formatDateTime(report.updatedAt)}</dd>
          </>
        )}
      </dl>

      <div className="action-list">
        <button type="button" className="button button--primary" onClick={handleToggleStatus}>
          {resolved ? 'Reopen report' : 'Mark as resolved'}
        </button>
        <button type="button" className="button button--secondary" onClick={() => onEdit(reportId)}>
          Edit report
        </button>
        <button
          type="button"
          className="button button--danger-outline"
          onClick={() => setConfirmingDelete(true)}
        >
          Delete report
        </button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete this report?"
          message="The report and its photo will be removed from this device. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </article>
  )
}
