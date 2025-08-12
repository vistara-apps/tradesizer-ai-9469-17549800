
'use client'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  variant?: 'default' | 'platformSelector'
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function Tabs({ variant = 'default', tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex space-x-2 mb-md">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${
            activeTab === tab.id ? 'tab-active' : 'tab-inactive'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
