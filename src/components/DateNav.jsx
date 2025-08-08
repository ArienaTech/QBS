import { ChevronLeft, ChevronRight } from 'lucide-react'

function parseISOToDate(iso) {
  return new Date(iso + 'T00:00:00')
}

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isoToday() {
  const d = new Date()
  return toISO(d)
}

function startOfWeekMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function addMonths(date, n) {
  const d = new Date(date)
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  return d
}

function formatLabel(view, iso) {
  const d = parseISOToDate(iso)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  if (view === 'day') {
    return `${dows[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()].slice(0,3)} ${d.getFullYear()}`
  }
  if (view === 'month') {
    return `${months[d.getMonth()]} ${d.getFullYear()}`
  }
  // week or workweek: show range Mon..Sun/Mon..Fri
  const start = startOfWeekMonday(d)
  const length = view === 'week' ? 7 : 5
  const end = addDays(start, length - 1)
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${months[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`
  }
  return `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
}

export default function DateNav({ view, currentDateISO, onChange }) {
  const label = formatLabel(view, currentDateISO)

  function goPrev() {
    const d = parseISOToDate(currentDateISO)
    let next
    if (view === 'day') next = addDays(d, -1)
    else if (view === 'week' || view === 'workweek') next = addDays(d, -7)
    else next = addMonths(d, -1)
    onChange?.(toISO(next))
  }

  function goNext() {
    const d = parseISOToDate(currentDateISO)
    let next
    if (view === 'day') next = addDays(d, 1)
    else if (view === 'week' || view === 'workweek') next = addDays(d, 7)
    else next = addMonths(d, 1)
    onChange?.(toISO(next))
  }

  function goToday() {
    onChange?.(isoToday())
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex rounded-md border border-slate-300 bg-white shadow-sm overflow-hidden">
        <button type="button" onClick={goPrev} className="px-2 py-1.5 text-slate-700 hover:bg-slate-50" aria-label="Previous">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="px-3 py-1.5 text-sm font-medium text-slate-800 min-w-[12ch] text-center">
          {label}
        </div>
        <button type="button" onClick={goNext} className="px-2 py-1.5 text-slate-700 hover:bg-slate-50" aria-label="Next">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <button type="button" onClick={goToday} className="px-2.5 py-1.5 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm">
        Today
      </button>
    </div>
  )
}