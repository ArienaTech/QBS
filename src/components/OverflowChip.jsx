import { useState } from 'react'

export default function OverflowChip({ startMinutes, endMinutes, hiddenCount, hiddenEvents = [], slotHeightPx, dayStartMinutes }) {
  const top = ((startMinutes - dayStartMinutes) / 30) * slotHeightPx
  const height = ((endMinutes - startMinutes) / 30) * slotHeightPx

  const [open, setOpen] = useState(false)

  return (
    <div className="absolute left-0 right-0" style={{ top: `${top}px`, height: `${height}px` }}>
      <div className="absolute right-1 bottom-1">
        <button
          type="button"
          className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800/80 text-white hover:bg-slate-800"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${hiddenCount} more overlapping meetings`}
        >
          +{hiddenCount} more
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-64 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg p-2">
            <div className="text-xs text-slate-500 mb-1">Overlapping meetings</div>
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