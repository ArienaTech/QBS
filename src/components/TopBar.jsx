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
    <header className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-800/60">
      <div className="h-16 flex items-center gap-3 md:gap-4 px-4 md:px-6">
        {/* Removed title to satisfy request */}
        <div className="flex-1 max-w-xl">
          <label className="relative block">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="search"
              placeholder="Search matters or meetings..."
              className="w-full rounded-md border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-slate-600"
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
            <div className="h-9 w-9 rounded-full bg-slate-700 text-slate-100 flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">{user?.name || 'User'}</div>
              <div className="text-[11px] text-emerald-400/90 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Logged in
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}