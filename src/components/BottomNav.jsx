const TABS = [
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'new', label: 'Report', icon: '➕' },
  { id: 'list', label: 'My reports', icon: '📋' },
]

/**
 * Bottom tab bar – the usual navigation pattern on phones, within thumb reach.
 * The parent (App) owns the active tab; this component only reports clicks.
 */
export default function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            className={isActive ? 'bottom-nav__item bottom-nav__item--active' : 'bottom-nav__item'}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(tab.id)}
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="bottom-nav__label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
