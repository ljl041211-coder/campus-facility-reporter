import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import EditReportPage from './pages/EditReportPage.jsx'
import MapPage from './pages/MapPage.jsx'
import NewReportPage from './pages/NewReportPage.jsx'
import ReportDetailPage from './pages/ReportDetailPage.jsx'
import ReportListPage from './pages/ReportListPage.jsx'
import './App.css'

// Title shown in the header for each screen.
const TITLES = {
  list: 'My reports',
  map: 'Campus map',
  new: 'New report',
  detail: 'Report details',
  edit: 'Edit report',
}

export default function App() {
  const [view, setView] = useState({ name: 'list', reportId: null, from: null })

  function navigate(name, reportId = null, from = null) {
    setView({ name, reportId, from })
    window.scrollTo(0, 0)
  }

  // Which tab is highlighted. Detail and edit screens keep the tab they were opened from.
  const activeTab =
    view.name === 'new' ? 'new' : view.name === 'map' || view.from === 'map' ? 'map' : 'list'

  // Where the back arrow leads: edit -> detail -> the list or the map.
  let goBack = null
  if (view.name === 'edit') {
    goBack = () => navigate('detail', view.reportId, view.from)
  } else if (view.name === 'detail') {
    goBack = view.from === 'map' ? () => navigate('map', view.reportId) : () => navigate('list')
  }

  return (
    <div className="app">
      <header className="app-header">
        {goBack && (
          <button type="button" className="app-header__back" onClick={goBack} aria-label="Back">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
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

        {view.name === 'map' && (
          <MapPage
            focusReportId={view.reportId}
            onOpenReport={(id) => navigate('detail', id, 'map')}
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
            onEdit={(id) => navigate('edit', id, view.from)}
            onDeleted={() => navigate(view.from === 'map' ? 'map' : 'list')}
            onShowOnMap={(id) => navigate('map', id)}
          />
        )}

        {view.name === 'edit' && (
          <EditReportPage
            reportId={view.reportId}
            onSaved={(id) => navigate('detail', id, view.from)}
            onCancel={() => navigate('detail', view.reportId, view.from)}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChange={(tab) => navigate(tab)} />
    </div>
  )
}
