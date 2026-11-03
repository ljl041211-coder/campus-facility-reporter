# Campus Facility Reporter – project guide for Claude

## Context

- Individual coursework: UWS COMP10013 Dynamic Web Technologies, CW01 (2026/27). Deadline: 6 December 2026.
- Topic: pre-approved Project Idea 4 (outdoor Reporting App). Scenario: students report damaged outdoor facilities on the UWS campus or a similar large outdoor site (broken street light, damaged pavement, overflowing bin, damaged seating, road safety hazard, blocked accessible ramp).
- AI use: the official assessment guidance still says GenAI "Type 1 Restricted", but the student reports that the lecturer has since allowed AI for writing code (documents not yet updated). AI use is declared in the README and the Student Declaration.
- The student must explain the code in a ~5-minute narrated video and may face a 1-to-1 demo with detailed code questions. Keep the code simple and readable, and explain every change.

## Assessment requirements the code must meet

- Installable mobile app: PWA served over HTTPS (Vercel).
- At least two device APIs that work and fit the app's purpose: Camera (react-webcam, rear camera) and Geolocation.
- Persistent on-device storage with full CRUD (Create, Read, Update, Delete); data must survive closing and reopening the app.
- The video shows every CRUD operation and both APIs working, then walks through the source: why this storage, how permissions and API errors are handled, component structure, state management, extra features.
- Code quality and extras: hooks, reusable components, clear architecture, appropriate external libraries, features beyond the minimum.
- GitHub repository with README (install, run, configuration, usage). More than one commit; commits after the deadline are ignored.
- Third-party libraries, icons and map data must be credited.

## Agreed product decisions

- User: a student, who creates and manages their own reports.
- Flow: spot a problem → take a photo, location recorded automatically → choose category, write description, optional location note, drag the marker if GPS is off → save → report appears in the list and on the map → view details → edit it, or mark it "Resolved" once fixed → delete mistaken or duplicate reports (photo deleted too).
- Categories are in `src/constants/categories.js`: lighting, pavement, waste, furniture, safety, accessibility.
- Status: `open` ("Needs repair") or `resolved`.
- Map: Leaflet + react-leaflet + OpenStreetMap tiles (show attribution). Open reports use animated cartoon markers (one original SVG per category, `L.divIcon` + CSS animation); resolved reports use a static, muted marker. Respect `prefers-reduced-motion`; never rely on colour alone. Tiles need a network connection, so the list view stays as the fallback.
- Extension B, only after the core is complete and tested on a phone: a password-protected "facilities staff mode" that can change report status. The password is stored locally, so it is not real security; say so honestly.
- Feature cut-off: 30 November 2026. 1–6 December is for the PowerPoint, the video and submission.

## Build order

1. Project skeleton – done
2. CRUD: report form, list, detail view, edit, mark resolved, delete – next
3. Camera and Geolocation for each report, handling permission denied, cancel, errors and timeouts
4. Map with plain markers
5. Animated cartoon markers
6. Extension B (staff mode)

## Tech and architecture

- React 19 + Vite, JavaScript (not TypeScript). vite-plugin-pwa for the manifest and service worker.
- Dexie + dexie-react-hooks (`useLiveQuery`). One IndexedDB database `campusReporterDB` with two tables: `reports` (`++id, category, status, createdAt`) and `photos` (`reportId` as primary key). Create or delete a report and its photo in one Dexie transaction. Change the schema by adding a new `db.version()`.
- Navigation: `activeTab` state in `App.jsx`, no router. A selected report id can be added for the detail view.
- Styles: design tokens in `src/index.css`, layout and component styles in `src/App.css`. Mobile-first, 48px touch targets, visible focus outlines, status shown with text as well as colour.
- Camera and Geolocation need HTTPS (localhost is fine for development). Test them on the Vercel deployment on a real phone; use Chrome DevTools → Sensors to simulate locations.

## Working rules

- Work in small steps. After each step the app must still build (`npm run build`).
- Before writing code for a new step, describe the plan and wait for the student's approval.
- After each step, explain in Chinese: what changed, which files, why this approach, what to test on the phone, and what to say about it in the video.
- Suggest a commit message; the student commits and pushes themselves.
- Ask before adding new dependencies or changing an agreed decision.
- UI text and code comments in English (UK).
- Keep the README feature table up to date. Do not remove the AI assistance note in the README.
