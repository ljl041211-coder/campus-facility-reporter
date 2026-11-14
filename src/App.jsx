import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import EditReportPage from './pages/EditReportPage.jsx'
import NewReportPage from './pages/NewReportPage.jsx'
import ReportDetailPage from './pages/ReportDetailPage.jsx'
import ReportListPage from './pages/ReportListPage.jsx'
import './App.css'

// Title shown in the header for each screen.
const TITLES = {
  list: 'My reports',
  new: 'New report',
  detail: 'Report details',
  edit: 'Edit report',
}

/**
 * The app shell: header, the current screen and the bottom tab bar.
 *
 * One piece of state, `view`, decides which screen is shown, so no router
 * library is needed. `view.reportId` says which report the detail and edit
 * screens work on.
 */
export default function App() {
  const [view, setView] = useState({ name: 'list', reportId: null })

  function navigate(name, reportId = null) {
    setView({ name, reportId })
    window.scrollTo(0, 0)
  }

  // The detail and edit screens belong to the "My reports" tab.
  const activeTab = view.name === 'new' ? 'new' : 'list'

  // Where the back arrow leads: edit -> detail -> list.
  const backTarget =
    view.name === 'edit'
      ? () => navigate('detail', view.reportId)
      : view.name === 'detail'
        ? () => navigate('list')
        : null

  return (
    <div className="app">
      <header className="app-header">
        {backTarget && (
          <button type="button" className="app-header__back" onClick={backTarget} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        <h1 className="app-header__title">{TITLES[view.name]}</h1>
      </header>

      <main className="app-main">
        {view.name === 'list' && (
          <ReportListPage
            onOpenReport={(id) => navigate('detail', id)}
            onCreate={() => navigate('new')}
          />
        )}

        {view.name === 'new' && (
          <NewReportPage
            onSaved={(id) => navigate('detail', id)}
            onCancel={() => navigate('list')}
          />
        )}

        {view.name === 'detail' && (
          <ReportDetailPage
            reportId={view.reportId}
            onEdit={(id) => navigate('edit', id)}
            onDeleted={() => navigate('list')}
          />
        )}

        {view.name === 'edit' && (
          <EditReportPage
            reportId={view.reportId}
            onSaved={(id) => navigate('detail', id)}
            onCancel={() => navigate('detail', view.reportId)}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChange={(tab) => navigate(tab)} />
    </div>
  )
}
