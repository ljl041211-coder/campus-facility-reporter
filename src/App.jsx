import { useEffect, useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import EditReportPage from './pages/EditReportPage.jsx'
import MapPage from './pages/MapPage.jsx'
import NewReportPage from './pages/NewReportPage.jsx'
import ReportDetailPage from './pages/ReportDetailPage.jsx'
import ReportListPage from './pages/ReportListPage.jsx'
import './App.css'

const TITLES = {
  map: 'Campus map',
  new: 'New report',
  list: 'My reports',
  detail: 'Report details',
  edit: 'Edit report',
}

// Where the header's Back button goes from each sub-screen.
const BACK_TARGET = {
  detail: 'list',
  edit: 'detail',
}

/**
 * Navigation without a router: `activeTab` decides which screen is shown.
 * 'map', 'new' and 'list' are the three bottom tabs; 'detail' and 'edit' are
 * sub-screens of "My reports" and use `selectedReportId` to know which report to show.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedReportId, setSelectedReportId] = useState(null)

  // Start each new screen at the top, like a normal page change.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeTab])

  function openReport(id) {
    setSelectedReportId(id)
    setActiveTab('detail')
  }

  function renderPage() {
    switch (activeTab) {
      case 'map':
        return <MapPage />
      case 'new':
        return <NewReportPage onSaved={() => setActiveTab('list')} />
      case 'detail':
        return (
          <ReportDetailPage
            reportId={selectedReportId}
            onEdit={() => setActiveTab('edit')}
            onDeleted={() => setActiveTab('list')}
            onBack={() => setActiveTab('list')}
          />
        )
      case 'edit':
        return <EditReportPage reportId={selectedReportId} onDone={() => setActiveTab('detail')} />
      default:
        return <ReportListPage onNavigate={setActiveTab} onOpenReport={openReport} />
    }
  }

  const backTarget = BACK_TARGET[activeTab]
  // Detail and edit belong to "My reports", so keep that tab highlighted.
  const highlightedTab = backTarget ? 'list' : activeTab

  return (
    <div className="app">
      <header className="app-header">
        {backTarget && (
          <button type="button" className="app-header__back" onClick={() => setActiveTab(backTarget)}>
            <span aria-hidden="true">←</span> Back
          </button>
        )}
        <h1 className="app-header__title">{TITLES[activeTab]}</h1>
      </header>

      <main className="app-main">{renderPage()}</main>

      <BottomNav activeTab={highlightedTab} onChange={setActiveTab} />
    </div>
  )
}
