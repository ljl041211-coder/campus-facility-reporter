import { useLiveQuery } from 'dexie-react-hooks'
import ReportForm from '../components/ReportForm.jsx'
import { getPhoto, getReport, updateReport } from '../db.js'

export default function EditReportPage({ reportId, onSaved, onCancel }) {
  const report = useLiveQuery(() => getReport(reportId), [reportId])
  const photo = useLiveQuery(() => getPhoto(reportId), [reportId])

  // undefined = IndexedDB has not answered yet; null = nothing was found.
  if (report === undefined || photo === undefined) {
    return <p className="status-text">Loading report…</p>
  }

  if (report === null) {
    return <p className="status-text">This report no longer exists.</p>
  }

  async function handleSubmit({ fields, photo: newPhoto, photoChanged }) {
    // Passing undefined tells updateReport() to leave the stored photo untouched.
    await updateReport(reportId, fields, photoChanged ? newPhoto : undefined)
    onSaved(reportId)
  }

  return (
    <ReportForm
      initialReport={report}
      initialPhoto={photo}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}
