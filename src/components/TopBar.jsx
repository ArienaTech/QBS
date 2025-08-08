import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U'
}

export default function TopBar({ user }) {
  const initials = getInitials(user?.name)

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const mobileInputRef = useRef(null)

  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [mobileSearchOpen])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setMobileSearchOpen(false)
    }
    if (mobileSearchOpen) {
      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileSearchOpen])

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-800/60">
      <div className="h-16 flex items-center gap-3 md:gap-4 px-4 md:px-6">
        {/* Desktop search */}
        <div className="hidden md:block flex-1 max-w-xl">
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

        {/* Mobile search button */}
        <button
          type="button"
          aria-label="Open search"
          aria-expanded={mobileSearchOpen}
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-800/70"
        >
          <Search className="h-5 w-5" />
        </button>

        <div className="ml-auto flex items-center gap-3 md:gap-4">

          <div className="hidden sm:flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full bg-slate-700 text-slate-100 flex items-center justify-center text-sm font-semibold"
              role="img"
              aria-label={`User avatar for ${user?.name || 'User'}`}
              title={user?.name || 'User'}
            >
              {initials}
            </div>
            <div className="leading-tight" aria-label={`Logged in as ${user?.name || 'User'}`}>
              <div className="text-sm font-medium">{user?.name || 'User'}</div>
              <div className="text-[11px] text-emerald-400/90 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Logged in
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-slate-900/60"
            onClick={() => setMobileSearchOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed z-50 inset-x-0 top-0 p-3">
            <div
              className="rounded-md border border-slate-700 bg-slate-800 flex items-center gap-2 p-2 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Search className="h-5 w-5 text-slate-400 ml-1" />
              <input
                ref={mobileInputRef}
                type="search"
                aria-label="Search matters or meetings"
                placeholder="Search matters or meetings..."
                className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-400 outline-none text-sm"
              />
              <button
                type="button"
                aria-label="Close search"
                className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-700"
                onClick={() => setMobileSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}