import { db } from '../db.js'

/**
 * All database writes for reports live in this file, so the page components
 * never talk to Dexie directly. Pages call these functions; useLiveQuery in the
 * pages then picks up the change and re-renders automatically.
 *
 * The form gives us one `values` object:
 *   { category, description, locationNote, location, photo }
 * where location is { latitude, longitude, accuracy, source } or null,
 * and photo is a JPEG Blob or null.
 */

// Remove extra spaces before saving, and split the location into the
// columns described in db.js (null when no location was recorded).
function toReportFields({ category, description, locationNote, location }) {
  return {
    category,
    description: description.trim(),
    locationNote: locationNote.trim(),
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    accuracy: location?.accuracy ?? null,
    locationSource: location?.source ?? null, // 'gps' | 'map' | null
  }
}

/**
 * CREATE – saves a new report and its photo (if any), returns the new id.
 * The report and the photo are written in ONE transaction: if saving the
 * photo fails (for example, the phone is out of storage), the report is not
 * saved either, so the student can simply try again.
 */
export async function createReport(values) {
  const now = Date.now()
  return db.transaction('rw', db.reports, db.photos, async () => {
    const id = await db.reports.add({
      ...toReportFields(values),
      status: 'open',
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    })
    if (values.photo) {
      await db.photos.add({ reportId: id, image: values.photo, createdAt: now })
    }
    return id
  })
}

/**
 * UPDATE – saves the edited form, including a new or removed photo,
 * again in one transaction.
 */
export async function updateReport(id, values) {
  const now = Date.now()
  await db.transaction('rw', db.reports, db.photos, async () => {
    await db.reports.update(id, {
      ...toReportFields(values),
      updatedAt: now,
    })
    if (values.photo) {
      // put() adds the photo, or replaces the old one with the same reportId.
      await db.photos.put({ reportId: id, image: values.photo, createdAt: now })
    } else {
      await db.photos.delete(id)
    }
  })
}

/** UPDATE – marks a report as 'resolved', or reopens it as 'open'. */
export async function setReportStatus(id, status) {
  const now = Date.now()
  await db.reports.update(id, {
    status,
    resolvedAt: status === 'resolved' ? now : null,
    updatedAt: now,
  })
}

/**
 * DELETE – removes a report and its photo.
 * Both deletes run inside one transaction: if either fails, Dexie rolls back
 * both, so we never end up with a photo that has no report (or the reverse).
 */
export async function deleteReport(id) {
  await db.transaction('rw', db.reports, db.photos, async () => {
    await db.photos.delete(id)
    await db.reports.delete(id)
  })
}
