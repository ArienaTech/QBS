import { Search } from 'lucide-react'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U'
}

export default function TopBar({ onAddMeeting, user }) {
  const initials = getInitials(user?.name)

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <div className="h-16 flex items-center gap-3 md:gap-4 px-4 md:px-6">
        <div className="text-base md:text-lg font-semibold text-slate-800 whitespace-nowrap">Queensland Corrective Services</div>

        <div className="flex-1 max-w-xl">
          <label className="relative block">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="search"
              placeholder="Search matters or meetings..."
              className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-3 md:gap-4">
          <button
            onClick={onAddMeeting}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-md shadow-sm transition-colors"
          >
            <span>Add Meeting</span>
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-slate-800">{user?.name || 'User'}</div>
              <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Logged in
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}