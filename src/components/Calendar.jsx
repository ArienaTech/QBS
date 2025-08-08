import { useEffect, useMemo, useState } from 'react'
import MeetingBlock from './MeetingBlock.jsx'

import NowMarker from './NowMarker.jsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slotHeightPx = 48
const startTimeMinutes = 8 * 60 // 8:00 AM
const endTimeMinutes = 16 * 60 + 30 // 4:30 PM
const timeGutterWidthPx = 112

function generateTimeSlots() {
  const slots = []
  for (let m = startTimeMinutes; m <= endTimeMinutes; m += 30) slots.push(m)
  return slots
}

function formatTimeLabel(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const period = hours24 >= 12 ? 'PM' : 'AM'
  let hour12 = hours24 % 12
  if (hour12 === 0) hour12 = 12
  return `${hour12}:${minutes.toString().padStart(2, '0')}${period}`
}

function isoToday() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMinutesSinceMidnight(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes()
}

function startOfWeekMonday(date) {
  const d = new Date(date)
  const day = d.getDay() // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7 // 0 Mon .. 6 Sun
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date) {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, num) {
  const d = new Date(date)
  d.setDate(d.getDate() + num)
  return d
}

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDayHeader(date) {
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][(date.getDay() + 6) % 7]
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${dow} ${dd}/${mm}`
}

function useMaxVisibleColumns() {
  const [maxCols, setMaxCols] = useState(5)
  useEffect(() => {
    function compute() {
      if (typeof window === 'undefined') return 5
      const w = window.innerWidth
      if (w < 640) return 1
      if (w < 1024) return 3
      return 5
    }
    function onResize() { setMaxCols(compute()) }
    setMaxCols(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return maxCols
}

function layoutMeetingsForDay(dayMeetings, dayKey, maxVisibleColumns = 5, expandedClumpIds = new Set()) {
  if (!dayMeetings || dayMeetings.length === 0) return { events: [], maxConcurrent: 0 }
  const sorted = [...dayMeetings].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes
    return (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes)
  })
  const laidOut = []
  let clumpStartIdx = 0
  let clumpMaxEnd = sorted[0].endMinutes
  let maxConcurrentAcrossClumps = 0
  function assignColumnsForClump(startIdx, endIdx) {
    const clump = sorted.slice(startIdx, endIdx + 1)
    const columnEndTimes = []
    const eventColumnIndex = new Map()
    let maxConcurrent = 0
    let clumpStartMin = Infinity
    let clumpEndMin = -Infinity
    for (const evt of clump) {
      clumpStartMin = Math.min(clumpStartMin, evt.startMinutes)
      clumpEndMin = Math.max(clumpEndMin, evt.endMinutes)
      let placedColumn = -1
      for (let i = 0; i < columnEndTimes.length; i++) {
        if (evt.startMinutes >= columnEndTimes[i]) { placedColumn = i; break }
      }
      if (placedColumn === -1) { placedColumn = columnEndTimes.length; columnEndTimes.push(evt.endMinutes) }
      else { columnEndTimes[placedColumn] = evt.endMinutes }
      eventColumnIndex.set(evt, placedColumn)
      maxConcurrent = Math.max(maxConcurrent, columnEndTimes.length)
    }
    const clumpId = `clump-${dayKey}-${clumpStartMin}-${clumpEndMin}`
    const isExpanded = expandedClumpIds.has(clumpId)
    // We always compute against total columns so we can horizontally scroll to see more
    // All events get their absolute left/width based on the total columns for the clump
    for (const evt of clump) {
      const colIdx = eventColumnIndex.get(evt) || 0
      laidOut.push({ ...evt, __layout: { columnIndex: colIdx, columnCount: maxConcurrent } })
    }
    maxConcurrentAcrossClumps = Math.max(maxConcurrentAcrossClumps, maxConcurrent)
  }
  for (let i = 1; i < sorted.length; i++) {
    const evt = sorted[i]
    if (evt.startMinutes < clumpMaxEnd) clumpMaxEnd = Math.max(clumpMaxEnd, evt.endMinutes)
    else { assignColumnsForClump(clumpStartIdx, i - 1); clumpStartIdx = i; clumpMaxEnd = evt.endMinutes }
  }
  assignColumnsForClump(clumpStartIdx, sorted.length - 1)
  return { events: laidOut, maxConcurrent: maxConcurrentAcrossClumps }
}

function getMonthPillClass(type) {
  switch (type) {
    case 'General':
      return 'bg-blue-50 text-blue-800 border border-blue-200'
    case 'Suspensions':
      return 'bg-pink-50 text-pink-800 border border-pink-200'
    case 'Reviews':
      return 'bg-emerald-50 text-emerald-800 border border-emerald-200'
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
}

export default function Calendar({ meetings = [], view = 'workweek', currentDateISO, onChangeDate }) {
  const slots = generateTimeSlots()
  const maxVisibleColumns = useMaxVisibleColumns()
  const [expandedClumpIds, setExpandedClumpIds] = useState(new Set())
  const dayScrollRefs = useState(() => new Map())[0]
  const [scrollHints, setScrollHints] = useState({})

  function updateScrollHints(dayKey) {
    const el = dayScrollRefs.get(dayKey)
    if (!el) return
    const canLeft = el.scrollLeft > 0
    const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setScrollHints((prev) => {
      const prevForDay = prev[dayKey] || {}
      if (prevForDay.canLeft === canLeft && prevForDay.canRight === canRight) return prev
      return { ...prev, [dayKey]: { canLeft, canRight } }
    })
  }

  function toggleClumpExpansion(clumpId) {
    setExpandedClumpIds((prev) => { const next = new Set(prev); if (next.has(clumpId)) next.delete(clumpId); else next.add(clumpId); return next })
  }

  // Dates for the active view
  const todayISO = isoToday()
  const baseDate = useMemo(() => (currentDateISO ? new Date(currentDateISO + 'T00:00:00') : new Date()), [currentDateISO])

  const dayList = useMemo(() => {
    if (view === 'day') {
      const d = baseDate
      return [{ date: d, iso: toISODate(d), key: toISODate(d), label: formatDayHeader(d) }]
    }
    if (view === 'week') {
      const start = startOfWeekMonday(baseDate)
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i)
        return { date: d, iso: toISODate(d), key: toISODate(d), label: formatDayHeader(d) }
      })
    }
    // workweek default
    const start = startOfWeekMonday(baseDate)
    return Array.from({ length: 5 }, (_, i) => {
      const d = addDays(start, i)
      return { date: d, iso: toISODate(d), key: toISODate(d), label: formatDayHeader(d) }
    })
  }, [view, baseDate])

  // Now marker position (used in time-based views)
  const [nowTopPx, setNowTopPx] = useState(() => ((getMinutesSinceMidnight() - startTimeMinutes) / 30) * slotHeightPx)
  useEffect(() => { const i = setInterval(() => setNowTopPx(((getMinutesSinceMidnight() - startTimeMinutes) / 30) * slotHeightPx), 30000); return () => clearInterval(i) }, [])

  // Month grid computation
  if (view === 'month') {
    const startMonth = startOfMonth(baseDate)
    const weekStart = startOfWeekMonday(startMonth)
    const days = Array.from({ length: 42 }, (_, i) => addDays(weekStart, i))
    const currentMonth = baseDate.getMonth()

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[960px] rounded-lg border border-slate-200 bg-white shadow-sm p-4">
          <div className="grid grid-cols-7 text-xs font-medium text-slate-500 px-1 mb-2">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (<div key={d} className="px-2 py-1 text-center">{d}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, idx) => {
              const iso = toISODate(d)
              const inMonth = d.getMonth() === currentMonth
              const isToday = iso === todayISO
              const dayMeetings = meetings
                .filter((m) => (m.date ? m.date === iso : false))
                .sort((a, b) => a.startMinutes - b.startMinutes)
              const count = dayMeetings.length
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onChangeDate?.(iso)}
                  className={`relative aspect-[4/3] rounded-md border text-left ${inMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/70'} ${isToday ? 'ring-2 ring-red-400' : ''}`}
                >
                  <div className="absolute top-1 left-1 right-1 text-center text-[11px] font-medium text-slate-600">{d.getDate()}</div>
                  <div className="absolute inset-x-1 top-5 bottom-1 overflow-auto">
                    <div className="space-y-0.5 pr-1">
                      {dayMeetings.map((m) => (
                        <div key={m.id} className={`${getMonthPillClass(m.type)} truncate text-[11px] px-1 py-0.5 rounded`}>
                          <span className="font-medium">{formatTimeLabel(m.startMinutes)}</span> {m.title}
                        </div>
                      ))}

                    </div>
                  </div>
                  {count > 0 && (
                    <div className="absolute bottom-1 right-1 text-[11px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white">{count}</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Time-based views (day/workweek/week)
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[960px] rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Day headers */}
        <div className="grid" style={{ gridTemplateColumns: `${timeGutterWidthPx}px repeat(${dayList.length}, minmax(0, 1fr))` }}>
          <div className="h-14 border-b border-r border-slate-200 bg-slate-50/60" />
          {dayList.map((d) => {
            const dayCount = meetings.filter((mtg) => {
              if (mtg.date) return mtg.date === d.iso
              const legacyIndex = (d.date.getDay() + 6) % 7
              return typeof mtg.dayIndex === 'number' && mtg.dayIndex === legacyIndex
            }).length
            return (
              <div key={d.key} className="h-14 border-b border-slate-200 bg-slate-50/60 flex items-end justify-center px-3 pb-2 text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <span>{d.label}</span>
                  {dayCount > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white">{dayCount}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Grid body (scrollable) */}
        <div className="h-[65vh] overflow-y-auto">
          <div className="grid" style={{ gridTemplateColumns: `${timeGutterWidthPx}px repeat(${dayList.length}, minmax(0, 1fr))` }}>
            {/* Time gutter */}
            <div className="relative border-r border-slate-200">
              {slots.map((m) => (
                <div key={m} className="border-b border-slate-100 text-[11px] text-slate-500 pr-3 flex items-start justify-end pt-1" style={{ height: `${slotHeightPx}px` }}>
                  {formatTimeLabel(m)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {dayList.map((d) => {
              // Filter meetings by ISO date if available, fallback to legacy dayIndex for Mon-Fri mapping
              const dayMeetings = meetings.filter((mtg) => {
                if (mtg.date) return mtg.date === d.iso
                // legacy: map Monday-first index 0..4
                const legacyIndex = (d.date.getDay() + 6) % 7
                return typeof mtg.dayIndex === 'number' && mtg.dayIndex === legacyIndex
              })
              const { events: laidOut, maxConcurrent } = layoutMeetingsForDay(dayMeetings, d.iso, maxVisibleColumns, expandedClumpIds)
              const isToday = d.iso === todayISO
              const gridHeightPx = ((endTimeMinutes - startTimeMinutes) / 30 + 1) * slotHeightPx
              const widthScale = Math.max(1, (maxConcurrent || 1) / (maxVisibleColumns || 1))

              return (
                <div key={d.key} className="relative">
                  {slots.map((m) => (<div key={m} className="border-b border-slate-100" style={{ height: `${slotHeightPx}px` }} />))}
                  {isToday && nowTopPx >= 0 && nowTopPx <= gridHeightPx && (
                    <NowMarker topPx={nowTopPx} />
                  )}
                  {/* Horizontal overflow container for overlapping meetings */}
                  <div
                    className="absolute inset-x-0 top-0 overflow-x-auto scrollbar-thin"
                    style={{ height: `${gridHeightPx}px` }}
                    ref={(el) => {
                      if (el) {
                        dayScrollRefs.set(d.key, el)
                        // Defer to next tick to ensure sizes are measured
                        queueMicrotask(() => updateScrollHints(d.key))
                      } else {
                        dayScrollRefs.delete(d.key)
                        setScrollHints((prev) => {
                          const { [d.key]: _omit, ...rest } = prev
                          return rest
                        })
                      }
                    }}
                    onScroll={() => updateScrollHints(d.key)}
                  >
                    <div className="relative" style={{ width: `${widthScale * 100}%`, height: `${gridHeightPx}px` }}>
                      {laidOut.map((mtg) => (
                        <MeetingBlock key={mtg.id} meeting={mtg} slotHeightPx={slotHeightPx} dayStartMinutes={startTimeMinutes} columnIndex={mtg.__layout?.columnIndex || 0} columnCount={mtg.__layout?.columnCount || 1} />
                      ))}
                    </div>
                  </div>
                  {/* Scroll hint gradients */}
                  {widthScale > 1 && scrollHints[d.key]?.canLeft && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent" />
                  )}
                  {widthScale > 1 && scrollHints[d.key]?.canRight && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent" />
                  )}
                  {/* Arrow nudge buttons */}
                  {widthScale > 1 && scrollHints[d.key]?.canLeft && (
                    <button
                      type="button"
                      className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-6 w-6 rounded-full bg-slate-800/70 text-white flex items-center justify-center hover:bg-slate-800"
                      onClick={() => dayScrollRefs.get(d.key)?.scrollBy({ left: -160, behavior: 'smooth' })}
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  {widthScale > 1 && scrollHints[d.key]?.canRight && (
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-6 w-6 rounded-full bg-slate-800/70 text-white flex items-center justify-center hover:bg-slate-800"
                      onClick={() => dayScrollRefs.get(d.key)?.scrollBy({ left: 160, behavior: 'smooth' })}
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}