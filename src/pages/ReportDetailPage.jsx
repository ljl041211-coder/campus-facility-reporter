import { useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { getCategory, STATUSES } from '../constants/categories.js'
import { usePhotoUrl } from '../hooks/usePhotoUrl.js'
import { usePhoto, useReport } from '../hooks/useReport.js'
import { deleteReport, setReportStatus } from '../services/reports.js'
import { formatDate } from '../utils/formatDate.js'
import { formatCoordinates, getReportLocation } from '../utils/location.js'

/**
 * READ (one report) + UPDATE status + DELETE.
 * Shows every detail of the selected report, with buttons to edit it,
 * mark it as resolved (or reopen it) and delete it.
 */
export default function ReportDetailPage({ reportId, onEdit, onDeleted, onBack }) {
  const report = useReport(reportId)
  const photo = usePhoto(reportId)
  const photoUrl = usePhotoUrl(photo?.image)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleToggleStatus() {
    const newStatus = report.status === 'open' ? 'resolved' : 'open'
    setIsBusy(true)
    setErrorMessage('')
    try {
      await setReportStatus(report.id, newStatus)
    } catch (error) {
      setErrorMessage(`Could not change the status: ${error.message}`)
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDelete() {
    setIsBusy(true)
    setErrorMessage('')
    try {
      await deleteReport(report.id)
      setIsConfirmOpen(false)
      onDeleted()
    } catch (error) {
      setIsConfirmOpen(false)
      setErrorMessage(`Could not delete the report: ${error.message}`)
      setIsBusy(false)
    }
  }

  if (report === undefined) {
    return <p className="status-text">Loading report…</p>
  }

  if (report === null) {
    return (
      <section className="empty-state">
        <p className="empty-state__title">Report not found</p>
        <p>It may have been deleted.</p>
        <button type="button" className="button button--primary" onClick={onBack}>
          Back to my reports
        </button>
      </section>
    )
  }

  const category = getCategory(report.category)
  const isOpen = report.status === 'open'
  const location = getReportLocation(report)

  return (
    <article className="report-detail">
      <div className="report-detail__header">
        <span className="report-detail__icon" aria-hidden="true">
          {category?.emoji ?? '📍'}
        </span>
        <div>
          <h2 className="report-detail__title">{category?.label ?? 'Other problem'}</h2>
          <span className={`badge badge--${report.status}`}>{STATUSES[report.status]?.label ?? report.status}</span>
        </div>
      </div>

      {photoUrl && (
        <img src={photoUrl} alt={`Photo of the problem: ${category?.label ?? 'report'}`} className="photo-preview" />
      )}

      <dl className="detail-list">
        <div>
          <dt>Description</dt>
          <dd>{report.description}</dd>
        </div>
        <div>
          <dt>GPS location</dt>
          <dd>
            {location
              ? `${formatCoordinates(location)} (accurate to about ${location.accuracy} m)`
              : 'Not recorded'}
          </dd>
        </div>
        {report.locationNote && (
          <div>
            <dt>Location note</dt>
            <dd>{report.locationNote}</dd>
          </div>
        )}
        <div>
          <dt>Reported</dt>
          <dd>{formatDate(report.createdAt)}</dd>
        </div>
        {report.updatedAt !== report.createdAt && (
          <div>
            <dt>Last updated</dt>
            <dd>{formatDate(report.updatedAt)}</dd>
          </div>
        )}
        {report.resolvedAt && (
          <div>
            <dt>Resolved</dt>
            <dd>{formatDate(report.resolvedAt)}</dd>
          </div>
        )}
      </dl>

      {errorMessage && (
        <p className="error-text" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="button-stack">
        <button
          type="button"
          className={isOpen ? 'button button--primary' : 'button button--secondary'}
          onClick={handleToggleStatus}
          disabled={isBusy}
        >
          {isOpen ? '✓ Mark as resolved' : '↺ Reopen report'}
        </button>
        <button type="button" className="button button--secondary" onClick={onEdit} disabled={isBusy}>
          Edit report
        </button>
        <button
          type="button"
          className="button button--danger-outline"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isBusy}
        >
          Delete report
        </button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete this report?"
        message="The report and its photo will be removed from this phone. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isBusy={isBusy}
      />
    </article>
  )
}
