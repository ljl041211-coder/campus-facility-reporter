// Simple line icons drawn as SVG paths (24 x 24 grid).
const TABS = [
  { id: 'list', label: 'My reports', iconPath: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01' },
  { id: 'new', label: 'New report', iconPath: 'M12 5v14M5 12h14' },
]

/** Bottom tab bar, placed where a thumb can reach it on a phone. */
export default function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="bottom-nav__tab"
          aria-current={activeTab === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          <svg
            className="bottom-nav__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d={tab.iconPath} />
          </svg>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
