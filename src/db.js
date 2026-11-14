import Dexie from 'dexie'
import { STATUS } from './constants/categories.js'
import { resizeImage } from './utils/image.js'

// Reports and photos share one database for atomic writes.
export const db = new Dexie('campusReporterDB')

db.version(1).stores({
  reports: '++id, category, status, createdAt',
  photos: 'reportId',
})

const THUMBNAIL_SIZE = 160

function makeThumbnail(image) {
  return image ? resizeImage(image, THUMBNAIL_SIZE, 0.7) : null
}

/* ---------- READ ---------- */

/** All reports, newest first. */
export function getAllReports() {
  return db.reports.orderBy('createdAt').reverse().toArray()
}

/** One report, or null if it does not exist (for example after it was deleted). */
export async function getReport(id) {
  return (await db.reports.get(id)) ?? null
}

/** The full-size photo of a report as a data URL, or null if it has no photo. */
export async function getPhoto(reportId) {
  const photo = await db.photos.get(reportId)
  return photo?.image ?? null
}

/* ---------- CREATE ---------- */

/**
 * Saves a new report and, if there is one, its photo. Returns the new report id.
 * `fields` holds category, description, locationNote, latitude, longitude, accuracy.
 */
export async function createReport(fields, image) {
  // The thumbnail is drawn on a canvas, which is not a database operation, so it
  // must be finished BEFORE the transaction starts (IndexedDB transactions close
  // as soon as the code waits for anything else).
  const thumbnail = await makeThumbnail(image)

  return db.transaction('rw', db.reports, db.photos, async () => {
    const now = Date.now()
    const id = await db.reports.add({
      ...fields,
      thumbnail,
      status: STATUS.OPEN,
      createdAt: now,
      updatedAt: now,
    })
    if (image) {
      await db.photos.put({ reportId: id, image })
    }
    return id
  })
}

/* ---------- UPDATE ---------- */

/**
 * Changes the text and location of a report, and optionally its photo:
 *   newImage === undefined  keep the current photo
 *   newImage === null       remove the photo
 *   newImage is a data URL  replace the photo
 */
export async function updateReport(id, fields, newImage) {
  const changes = { ...fields, updatedAt: Date.now() }
  if (newImage !== undefined) {
    changes.thumbnail = await makeThumbnail(newImage)
  }

  return db.transaction('rw', db.reports, db.photos, async () => {
    await db.reports.update(id, changes)
    if (newImage === null) {
      await db.photos.delete(id)
    } else if (newImage !== undefined) {
      await db.photos.put({ reportId: id, image: newImage })
    }
  })
}

/** Marks a report as 'open' or 'resolved'. */
export function setReportStatus(id, status) {
  return db.reports.update(id, { status, updatedAt: Date.now() })
}

/* ---------- DELETE ---------- */

/** Deletes a report together with its photo. */
export function deleteReport(id) {
  return db.transaction('rw', db.reports, db.photos, async () => {
    await db.reports.delete(id)
    await db.photos.delete(id)
  })
}
