import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'

/**
 * Custom hook: reads one report and keeps it up to date.
 *
 * Returns:
 *   undefined – still loading from IndexedDB
 *   null      – no report with this id (for example, it was just deleted)
 *   object    – the report
 *
 * useLiveQuery itself returns undefined while loading, so "not found" is turned
 * into null to tell the two cases apart.
 */
export function useReport(id) {
  return useLiveQuery(async () => {
    if (id == null) return null
    const report = await db.reports.get(id)
    return report ?? null
  }, [id])
}

/**
 * Same idea for the photo of a report: undefined while loading,
 * null if the report has no photo, otherwise { reportId, image, createdAt }.
 * Photos are read separately, so the report list never loads every image.
 */
export function usePhoto(reportId) {
  return useLiveQuery(async () => {
    if (reportId == null) return null
    const photo = await db.photos.get(reportId)
    return photo ?? null
  }, [reportId])
}
