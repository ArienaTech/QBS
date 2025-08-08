import { useEffect, useRef, useState } from 'react'

export default function OverflowChip({ clumpId, startMinutes, endMinutes, hiddenCount, hiddenEvents = [], slotHeightPx, dayStartMinutes, onToggleExpand, isExpanded }) {
  const top = ((startMinutes - dayStartMinutes) / 30) * slotHeightPx
  const height = ((endMinutes - startMinutes) / 30) * slotHeightPx

  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.addEventListener('mousedown', onClick)
      return () => {
        document.removeEventListener('keydown', onKey)
        document.removeEventListener('mousedown', onClick)
      }
    }
  }, [open])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <div className="absolute left-0 right-0" style={{ top: `${top}px`, height: `${height}px` }}>
      {/* subtle highlight of overlapped range when open */}
      {open && <div className="absolute inset-0 rounded-sm bg-blue-500/5 pointer-events-none" />}
      <div className="absolute right-1 bottom-1">
        <button
          type="button"
          className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800/80 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${hiddenCount} more overlapping meetings`}
        >
          +{hiddenCount} more
        </button>
        {open && (
          <div
            ref={popoverRef}
            className={
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-50 max-h-[60vh] rounded-t-lg border border-slate-200 bg-white shadow-lg p-3'
                : 'absolute z-50 mt-1 w-72 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg p-2 right-0'
            }
            role="dialog"
            aria-label="Overlapping meetings"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">Overlapping meetings</div>
              <button
                className="text-xs text-blue-600 hover:underline"
                type="button"
                onClick={() => {
                  onToggleExpand?.(clumpId)
                  setOpen(false)
                }}
              >
                {isExpanded ? 'Collapse' : 'Show all side-by-side'}
              </button>
            </div>
            <ul className="space-y-1">
              {hiddenEvents.map((ev) => (
                <li key={ev.id} className="text-sm">
                  <span className="font-medium">{format12Hour(ev.startMinutes)}–{format12Hour(ev.endMinutes)}</span> {ev.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function format12Hour(total) {
  const hours24 = Math.floor(total / 60)
  const minutes = total % 60
  const period = hours24 >= 12 ? 'PM' : 'AM'
  let hour12 = hours24 % 12
  if (hour12 === 0) hour12 = 12
  return `${hour12}:${minutes.toString().padStart(2, '0')}${period}`
}