import ReportForm from '../components/ReportForm.jsx'
import { createReport } from '../services/reports.js'

/**
 * CREATE: the "Report" tab.
 * autoLocate starts the Geolocation request as soon as the page opens,
 * so the location is usually ready by the time the photo is taken.
 */
export default function NewReportPage({ onSaved }) {
  async function handleSubmit(values) {
    await createReport(values)
    onSaved()
  }

  return <ReportForm autoLocate submitLabel="Save report" onSubmit={handleSubmit} />
}
