import ReportForm from '../components/ReportForm.jsx'
import { usePhoto, useReport } from '../hooks/useReport.js'
import { updateReport } from '../services/reports.js'
import { getReportLocation } from '../utils/location.js'

/**
 * UPDATE: edit any part of a report – text, photo or location.
 * Reuses the same ReportForm as the "Report" tab, filled with the saved values.
 * The location is NOT refreshed automatically here, so editing a report away
 * from the problem does not move it; the student can update it on purpose.
 */
export default function EditReportPage({ reportId, onDone }) {
  const report = useReport(reportId)
  const photo = usePhoto(reportId)

  async function handleSubmit(values) {
    await updateReport(reportId, values)
    onDone()
  }

  // Wait until both the report and its photo have been read.
  if (report === undefined || photo === undefined) {
    return <p className="status-text">Loading report…</p>
  }

  if (report === null) {
    return <p className="error-text">This report no longer exists.</p>
  }

  return (
    <ReportForm
      key={report.id}
      initialValues={{
        category: report.category,
        description: report.description,
        locationNote: report.locationNote ?? '',
        location: getReportLocation(report),
        photo: photo?.image ?? null,
      }}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onCancel={onDone}
    />
  )
}
