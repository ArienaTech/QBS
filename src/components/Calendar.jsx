import { useEffect, useState } from 'react'
import MeetingBlock from './MeetingBlock.jsx'
import OverflowChip from './OverflowChip.jsx'
import NowMarker from './NowMarker.jsx'

const baseDays = [
  { key: 'mon', label: 'Mon 04/08' },
  { key: 'tue', label: 'Tue 05/08' },
  { key: 'wed', label: 'Wed 06/08' },
  { key: 'thu', label: 'Thu 07/08' },
  { key: 'fri', label: 'Fri 08/08' },
]

const slotHeightPx = 48
const startTimeMinutes = 8 * 60 // 8:00 AM
const endTimeMinutes = 16 * 60 + 30 // 4:30 PM
const timeGutterWidthPx = 112

function generateTimeSlots() {
  const slots = []
  for (let m = startTimeMinutes; m <= endTimeMinutes; m += 30) {
    slots.push(m)
  }
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

function getTodayIndex() {
  const jsDay = new Date().getDay() // 0=Sun
  const mondayFirstIndex = (jsDay + 6) % 7 // 0=Mon..6=Sun
  return mondayFirstIndex >= 0 && mondayFirstIndex <= 4 ? mondayFirstIndex : -1
}

function getMinutesSinceMidnight(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes()
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

function layoutMeetingsForDay(dayMeetings, dayIndex, maxVisibleColumns = 5, expandedClumpIds = new Set()) {
  if (!dayMeetings || dayMeetings.length === 0) return { events: [], overflow: [] }
  const sorted = [...dayMeetings].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes
    return (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes)
  })
  const laidOut = []
  const overflowChips = []
  let clumpStartIdx = 0
  let clumpMaxEnd = sorted[0].endMinutes
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
    const clumpId = `clump-${dayIndex}-${clumpStartMin}-${clumpEndMin}`
    const isExpanded = expandedClumpIds.has(clumpId)
    const visibleColumns = isExpanded ? (maxConcurrent || 1) : Math.min(maxConcurrent || 1, maxVisibleColumns)
    for (const evt of clump) {
      const colIdx = eventColumnIndex.get(evt) || 0
      if (colIdx < visibleColumns) {
        laidOut.push({ ...evt, __layout: { columnIndex: colIdx, columnCount: visibleColumns } })
      }
    }
    if (!isExpanded) {
      const hiddenEvents = clump.filter((evt) => (eventColumnIndex.get(evt) || 0) >= visibleColumns)
      const hiddenCount = hiddenEvents.length
      if (hiddenCount > 0) {
        overflowChips.push({ id: `overflow-${dayIndex}-${clumpStartMin}-${clumpEndMin}`, clumpId, startMinutes: clumpStartMin, endMinutes: clumpEndMin, hiddenCount, hiddenEvents })
      }
    }
  }
  for (let i = 1; i < sorted.length; i++) {
    const evt = sorted[i]
    if (evt.startMinutes < clumpMaxEnd) clumpMaxEnd = Math.max(clumpMaxEnd, evt.endMinutes)
    else { assignColumnsForClump(clumpStartIdx, i - 1); clumpStartIdx = i; clumpMaxEnd = evt.endMinutes }
  }
  assignColumnsForClump(clumpStartIdx, sorted.length - 1)
  return { events: laidOut, overflow: overflowChips }
}

export default function Calendar({ meetings = [], view = 'workweek' }) {
  const slots = generateTimeSlots()
  const maxVisibleColumns = useMaxVisibleColumns()
  const [expandedClumpIds, setExpandedClumpIds] = useState(new Set())

  function toggleClumpExpansion(clumpId) {
    setExpandedClumpIds((prev) => { const next = new Set(prev); if (next.has(clumpId)) next.delete(clumpId); else next.add(clumpId); return next })
  }

  // Now marker
  const todayIndex = getTodayIndex()
  const [nowTopPx, setNowTopPx] = useState(() => ((getMinutesSinceMidnight() - startTimeMinutes) / 30) * slotHeightPx)
  useEffect(() => { const i = setInterval(() => setNowTopPx(((getMinutesSinceMidnight() - startTimeMinutes) / 30) * slotHeightPx), 30000); return () => clearInterval(i) }, [])

  // Determine days based on view
  let days
  if (view === 'day') {
    const ti = todayIndex >= 0 ? todayIndex : 0
    days = [baseDays[ti]]
  } else if (view === 'week') {
    // Simple week: prepend Sat/Sun labels for demo
    days = [
      { key: 'sat', label: 'Sat 03/08' },
      ...baseDays,
      { key: 'sun', label: 'Sun 09/08' },
    ]
  } else if (view === 'month') {
    // Placeholder month grid: 4 rows x 7 cols
    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[960px] rounded-lg border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold text-slate-800">Month view (placeholder)</div>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] border border-slate-200 rounded-md bg-slate-50" />
            ))}
          </div>
        </div>
      </div>
    )
  } else {
    // workweek
    days = baseDays
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[960px] rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Day headers */}
        <div className="grid" style={{ gridTemplateColumns: `${timeGutterWidthPx}px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="h-14 border-b border-r border-slate-200 bg-slate-50/60" />
          {days.map((d) => (
            <div key={d.key} className="h-14 border-b border-slate-200 bg-slate-50/60 flex items-end px-3 pb-2 text-sm font-medium text-slate-700">
              {d.label}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="grid" style={{ gridTemplateColumns: `${timeGutterWidthPx}px repeat(${days.length}, minmax(0, 1fr))` }}>
          {/* Time gutter */}
          <div className="relative border-r border-slate-200">
            {slots.map((m) => (
              <div key={m} className="border-b border-slate-100 text-[11px] text-slate-500 pr-3 flex items-start justify-end pt-1" style={{ height: `${slotHeightPx}px` }}>
                {formatTimeLabel(m)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, dayIndex) => {
            const realDayIndex = view === 'week' ? Math.max(0, Math.min(dayIndex - 1, 4)) : dayIndex // map Sat/Sun to edges
            const dayMeetings = meetings.filter((mtg) => mtg.dayIndex === realDayIndex)
            const { events: laidOut, overflow } = layoutMeetingsForDay(dayMeetings, realDayIndex, maxVisibleColumns, expandedClumpIds)

            return (
              <div key={d.key} className="relative">
                {slots.map((m) => (<div key={m} className="border-b border-slate-100" style={{ height: `${slotHeightPx}px` }} />))}
                {view !== 'month' && todayIndex === realDayIndex && nowTopPx >= 0 && nowTopPx <= ((endTimeMinutes - startTimeMinutes) / 30 + 1) * slotHeightPx && (
                  <NowMarker topPx={nowTopPx} />
                )}
                <div className="absolute inset-x-0 top-0" style={{ height: `${((endTimeMinutes - startTimeMinutes) / 30 + 1) * slotHeightPx}px` }}>
                  {laidOut.map((mtg) => (
                    <MeetingBlock key={mtg.id} meeting={mtg} slotHeightPx={slotHeightPx} dayStartMinutes={startTimeMinutes} columnIndex={mtg.__layout?.columnIndex || 0} columnCount={mtg.__layout?.columnCount || 1} />
                  ))}
                  {overflow.map((of) => (
                    <OverflowChip key={of.id} clumpId={of.clumpId} startMinutes={of.startMinutes} endMinutes={of.endMinutes} hiddenCount={of.hiddenCount} hiddenEvents={of.hiddenEvents} slotHeightPx={slotHeightPx} dayStartMinutes={startTimeMinutes} onToggleExpand={toggleClumpExpansion} isExpanded={expandedClumpIds.has(of.clumpId)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}