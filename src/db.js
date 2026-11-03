import Dexie from 'dexie'

/**
 * On-device database (IndexedDB, wrapped by Dexie).
 *
 * Design choice: reports AND their photos live in the same IndexedDB database,
 * in two tables linked by the report id. The Week 7 lab kept text in localStorage
 * and photos in IndexedDB; keeping both here means a report and its photo can be
 * created or deleted together in one transaction, so a deleted report never
 * leaves an orphan photo behind.
 *
 * reports table – one row per facility report
 *   id           auto-increment primary key
 *   category     one of the ids in src/constants/categories.js
 *   description  free text written by the student
 *   locationNote optional landmark text, e.g. "Left of the library entrance"
 *   status       'open' | 'resolved'
 *   latitude, longitude, accuracy   from the Geolocation API, or null if not recorded
 *   createdAt, updatedAt            timestamps in milliseconds
 *
 * photos table – at most one photo per report
 *   reportId     primary key, same value as reports.id
 *   image        the photo as a JPEG Blob (binary data, smaller than base64 text)
 *   createdAt    when the photo was taken or chosen
 *
 * Only the fields listed in stores() are indexed; the photo itself is never
 * indexed because large values should not be used as index keys.
 */
export const db = new Dexie('campusReporterDB')

db.version(1).stores({
  reports: '++id, category, status, createdAt',
  photos: 'reportId',
})
