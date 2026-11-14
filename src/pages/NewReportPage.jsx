import ReportForm from '../components/ReportForm.jsx'
import { createReport } from '../db.js'

export default function NewReportPage({ onSaved, onCancel }) {
  async function handleSubmit({ fields, photo }) {
    const id = await createReport(fields, photo)
    onSaved(id)
  }

  return (
    <>
      <p className="message message--info">
        In an emergency or immediate danger, contact campus security instead of using this app.
      </p>
      <ReportForm autoLocate submitLabel="Save report" onSubmit={handleSubmit} onCancel={onCancel} />
    </>
  )
}
