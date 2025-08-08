import { useEffect, useState } from 'react'
import MeetingBlock from './MeetingBlock.jsx'
import OverflowChip from './OverflowChip.jsx'
import NowMarker from './NowMarker.jsx'

const days = [
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
  // Map JS day (0 Sun..6 Sat) to our Monday-first index 0..4
  const jsDay = new Date().getDay() // 0=Sun
  const mondayFirstIndex = (jsDay + 6) % 7 // 0=Mon..6=Sun
  return mondayFirstIndex >= 0 && mondayFirstIndex <= 4 ? mondayFirstIndex : -1
}

function getMinutesSinceMidnight(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes()
}

// Responsive max columns: 1 on mobile (<640px), 3 on tablet (<1024px), 5 on desktop
function useMaxVisibleColumns() {
  const [maxCols, setMaxCols] = useState(5)

  useEffect(() => {
    function compute() {
      if (typeof window === 'undefined') return 5
      const w = window.innerWidth
      if (w < 640) return 1 // mobile
      if (w < 1024) return 3 // tablet
      return 5 // desktop
    }
    function onResize() {
      setMaxCols(compute())
    }
    setMaxCols(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return maxCols
}

// Given a list of meetings for a single day, compute side-by-side columns for overlapping groups, capping visible columns
function layoutMeetingsForDay(dayMeetings, dayIndex, maxVisibleColumns = 5, expandedClumpIds = new Set()) {
  if (!dayMeetings || dayMeetings.length === 0) return { events: [], overflow: [] }

  // Sort by start time, then by duration (longer first helps stable layout)
  const sorted = [...dayMeetings].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes
    return (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes)
  })

  const laidOut = []
  const overflowChips = []

  let clumpStartIdx = 0
  let clumpMaxEnd = sorted[0].endMinutes

  // Helper to assign columns within [startIdx, endIdx] inclusive slice
  function assignColumnsForClump(startIdx, endIdx) {
    const clump = sorted.slice(startIdx, endIdx + 1)

    // Active columns: track end time for each column
    const columnEndTimes = [] // index => last endMinutes
    const eventColumnIndex = new Map()
    let maxConcurrent = 0

    let clumpStartMin = Infinity
    let clumpEndMin = -Infinity

    for (const evt of clump) {
      clumpStartMin = Math.min(clumpStartMin, evt.startMinutes)
      clumpEndMin = Math.max(clumpEndMin, evt.endMinutes)

      // Find first free column where previous event has ended
      let placedColumn = -1
      for (let i = 0; i < columnEndTimes.length; i++) {
        if (evt.startMinutes >= columnEndTimes[i]) {
          placedColumn = i
          break
        }
      }
      if (placedColumn === -1) {
        placedColumn = columnEndTimes.length
        columnEndTimes.push(evt.endMinutes)
      } else {
        columnEndTimes[placedColumn] = evt.endMinutes
      }
      eventColumnIndex.set(evt, placedColumn)
      maxConcurrent = Math.max(maxConcurrent, columnEndTimes.length)
    }

    const clumpId = `clump-${dayIndex}-${clumpStartMin}-${clumpEndMin}`
    const isExpanded = expandedClumpIds.has(clumpId)

    const visibleColumns = isExpanded ? (maxConcurrent || 1) : Math.min(maxConcurrent || 1, maxVisibleColumns)

    // Push visible events with adjusted columnCount
    for (const evt of clump) {
      const colIdx = eventColumnIndex.get(evt) || 0
      if (colIdx < visibleColumns) {
        laidOut.push({
          ...evt,
          __layout: {
            columnIndex: colIdx,
            columnCount: visibleColumns,
          },
        })
      }
    }

    // Overflow chip if any hidden and not expanded
    if (!isExpanded) {
      const hiddenEvents = clump.filter((evt) => (eventColumnIndex.get(evt) || 0) >= visibleColumns)
      const hiddenCount = hiddenEvents.length
      if (hiddenCount > 0) {
        overflowChips.push({
          id: `overflow-${dayIndex}-${clumpStartMin}-${clumpEndMin}`,
          clumpId,
          startMinutes: clumpStartMin,
          endMinutes: clumpEndMin,
          hiddenCount,
          hiddenEvents,
        })
      }
    }
  }

  // Build clumps connected by overlap chains
  for (let i = 1; i < sorted.length; i++) {
    const evt = sorted[i]
    if (evt.startMinutes < clumpMaxEnd) {
      // still in clump
      clumpMaxEnd = Math.max(clumpMaxEnd, evt.endMinutes)
    } else {
      // close previous clump
      assignColumnsForClump(clumpStartIdx, i - 1)
      // start new clump
      clumpStartIdx = i
      clumpMaxEnd = evt.endMinutes
    }
  }
  // Close last clump
  assignColumnsForClump(clumpStartIdx, sorted.length - 1)

  return { events: laidOut, overflow: overflowChips }
}

export default function Calendar({ meetings = [] }) {
  const slots = generateTimeSlots()
  const maxVisibleColumns = useMaxVisibleColumns()
  const [expandedClumpIds, setExpandedClumpIds] = useState(new Set())

  function toggleClumpExpansion(clumpId) {
    setExpandedClumpIds((prev) => {
      const next = new Set(prev)
      if (next.has(clumpId)) next.delete(clumpId)
      else next.add(clumpId)
      return next
    })
  }

  // Live now marker state
  const todayIndex = getTodayIndex()
  const [nowTopPx, setNowTopPx] = useState(() => {
    const minutes = getMinutesSinceMidnight()
    return ((minutes - startTimeMinutes) / 30) * slotHeightPx
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = getMinutesSinceMidnight()
      setNowTopPx(((minutes - startTimeMinutes) / 30) * slotHeightPx)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[960px] rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Day headers */}
        <div className="grid" style={{ gridTemplateColumns: `${timeGutterWidthPx}px repeat(5, minmax(0, 1fr))` }}>
          <div className="h-14 border-b border-r border-slate-200 bg-slate-50/60" />
          {days.map((d) => (
            <div key={d.key} className="h-14 border-b border-slate-200 bg-slate-50/60 flex items-end px-3 pb-2 text-sm font-medium text-slate-700">
              {d.label}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="grid" style={{ gridTemplateColumns: `${timeGutterWidthPx}px repeat(5, minmax(0, 1fr))` }}>
          {/* Time gutter */}
          <div className="relative border-r border-slate-200">
            {slots.map((m) => (
              <div
                key={m}
                className="border-b border-slate-100 text-[11px] text-slate-500 pr-3 flex items-start justify-end pt-1"
                style={{ height: `${slotHeightPx}px` }}
              >
                {formatTimeLabel(m)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, dayIndex) => {
            const dayMeetings = meetings.filter((mtg) => mtg.dayIndex === dayIndex)
            const { events: laidOut, overflow } = layoutMeetingsForDay(dayMeetings, dayIndex, maxVisibleColumns, expandedClumpIds)

            return (
              <div key={d.key} className="relative">
                {/* Slot lines */}
                {slots.map((m) => (
                  <div key={m} className="border-b border-slate-100" style={{ height: `${slotHeightPx}px` }} />
                ))}

                {/* Now marker for today within working hours */}
                {todayIndex === dayIndex && nowTopPx >= 0 && nowTopPx <= ((endTimeMinutes - startTimeMinutes) / 30 + 1) * slotHeightPx && (
                  <NowMarker topPx={nowTopPx} />
                )}

                {/* Meetings for this day */}
                <div className="absolute inset-x-0 top-0" style={{ height: `${((endTimeMinutes - startTimeMinutes) / 30 + 1) * slotHeightPx}px` }}>
                  {laidOut.map((mtg) => (
                    <MeetingBlock
                      key={mtg.id}
                      meeting={mtg}
                      slotHeightPx={slotHeightPx}
                      dayStartMinutes={startTimeMinutes}
                      columnIndex={mtg.__layout?.columnIndex || 0}
                      columnCount={mtg.__layout?.columnCount || 1}
                    />
                  ))}
                  {overflow.map((of) => (
                    <OverflowChip
                      key={of.id}
                      clumpId={of.clumpId}
                      startMinutes={of.startMinutes}
                      endMinutes={of.endMinutes}
                      hiddenCount={of.hiddenCount}
                      hiddenEvents={of.hiddenEvents}
                      slotHeightPx={slotHeightPx}
                      dayStartMinutes={startTimeMinutes}
                      onToggleExpand={toggleClumpExpansion}
                      isExpanded={expandedClumpIds.has(of.clumpId)}
                    />
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