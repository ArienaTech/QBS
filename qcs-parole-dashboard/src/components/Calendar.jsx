import meetings from '../data/meetings.js'
import MeetingBlock from './MeetingBlock.jsx'

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

export default function Calendar() {
  const slots = generateTimeSlots()

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[960px] rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Day headers */}
        <div className="grid" style={{ gridTemplateColumns: '96px repeat(5, minmax(0, 1fr))' }}>
          <div className="h-14 border-b border-slate-200 bg-slate-50/60" />
          {days.map((d) => (
            <div key={d.key} className="h-14 border-b border-slate-200 bg-slate-50/60 flex items-end px-3 pb-2 text-sm font-medium text-slate-700">
              {d.label}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div className="grid" style={{ gridTemplateColumns: '96px repeat(5, minmax(0, 1fr))' }}>
          {/* Time gutter */}
          <div className="relative">
            {slots.map((m) => (
              <div
                key={m}
                className="border-b border-slate-100 text-[11px] text-slate-500 pr-2 flex items-start justify-end pt-1"
                style={{ height: `${slotHeightPx}px` }}
              >
                {formatTimeLabel(m)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, dayIndex) => (
            <div key={d.key} className="relative">
              {/* Slot lines */}
              {slots.map((m) => (
                <div key={m} className="border-b border-slate-100" style={{ height: `${slotHeightPx}px` }} />
              ))}

              {/* Meetings for this day */}
              <div className="absolute inset-x-0 top-0" style={{ height: `${((endTimeMinutes - startTimeMinutes) / 30 + 1) * slotHeightPx}px` }}>
                {meetings
                  .filter((mtg) => mtg.dayIndex === dayIndex)
                  .map((mtg) => (
                    <MeetingBlock
                      key={mtg.id}
                      meeting={mtg}
                      slotHeightPx={slotHeightPx}
                      dayStartMinutes={startTimeMinutes}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}