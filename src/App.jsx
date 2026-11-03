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

/**
 * Navigation without a router: `activeTab` decides which screen is shown.
 * 'map', 'new' and 'list' are the three bottom tabs; 'detail' and 'edit' are
 * sub-screens that use `selectedReportId` to know which report to show.
 * `returnTab` remembers where a report was opened from (the list or the map),
 * so the Back button goes back there.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [returnTab, setReturnTab] = useState('list')

  // Start each new screen at the top, like a normal page change.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeTab])

  function openReport(id) {
    setReturnTab(activeTab) // 'list' or 'map'
    setSelectedReportId(id)
    setActiveTab('detail')
  }

  function renderPage() {
    switch (activeTab) {
      case 'map':
        return <MapPage onOpenReport={openReport} onNavigate={setActiveTab} />
      case 'new':
        return <NewReportPage onSaved={() => setActiveTab('list')} />
      case 'detail':
        return (
          <ReportDetailPage
            reportId={selectedReportId}
            onEdit={() => setActiveTab('edit')}
            onDeleted={() => setActiveTab('list')}
            onBack={() => setActiveTab(returnTab)}
          />
        )
      case 'edit':
        return <EditReportPage reportId={selectedReportId} onDone={() => setActiveTab('detail')} />
      default:
        return <ReportListPage onNavigate={setActiveTab} onOpenReport={openReport} />
    }
  }

  // Where the header's Back button goes: details → list or map, edit → details.
  let backTarget = null
  if (activeTab === 'detail') backTarget = returnTab
  if (activeTab === 'edit') backTarget = 'detail'

  // On the detail and edit screens, keep the tab they were opened from highlighted.
  const highlightedTab = backTarget ? returnTab : activeTab

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

      {/* The map fills the screen, so its page has no padding. */}
      <main className={activeTab === 'map' ? 'app-main app-main--map' : 'app-main'}>{renderPage()}</main>

      <BottomNav activeTab={highlightedTab} onChange={setActiveTab} />
    </div>
  )
}
