import { Home, Search, Clock, FilePlus2, FileText, CalendarDays, ClipboardList, CalendarCheck2, Users2, ListTodo, BarChart2, Settings, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const menuItems = [
  { label: 'Home', icon: Home },
  { label: 'Search Matters', icon: Search },
  { label: 'Recent Matters', icon: Clock },
  { label: 'New Applications', icon: FilePlus2 },
  { label: 'New Matter', icon: FileText },
  { label: 'Board Meetings', icon: CalendarDays },
  { label: 'Meeting Capture', icon: ClipboardList, active: true },
  { label: 'Scheduling', icon: CalendarCheck2 },
  { label: 'Parties', icon: Users2 },
  { label: 'Actions', icon: ListTodo },
  { label: 'Reports', icon: BarChart2 },
  { label: 'Settings', icon: Settings },
  { label: 'Help', icon: HelpCircle },
]

export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const widthClass = collapsed ? 'md:w-16' : 'md:w-64 lg:w-72 xl:w-80'

  return (
    <aside className={`hidden md:flex ${widthClass} flex-col bg-slate-900 text-slate-100 min-h-screen`}>
      <div className="h-16 flex items-center px-2 border-b border-slate-800/60">
        {collapsed ? (
          <div className="w-full flex items-center justify-center">
            <button
              aria-label="Expand sidebar"
              onClick={onToggleCollapse}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-slate-800/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between px-3">
            <div className="text-lg font-semibold tracking-wide">Parole Board</div>
            <button
              aria-label="Collapse sidebar"
              onClick={onToggleCollapse}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-slate-800/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map(({ label, icon: Icon, active }) => (
            <li key={label}>
              <a
                href="#"
                title={label}
                className={`group flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-md transition-colors ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 opacity-90" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={`p-4 text-xs text-slate-400 border-t border-slate-800/60 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed ? '© Queensland Corrective Services' : '© QCS'}
      </div>
    </aside>
  )
}