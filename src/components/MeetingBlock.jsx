const typeToColor = {
  General: 'bg-blue-600/90 hover:bg-blue-600',
  Suspensions: 'bg-pink-500/90 hover:bg-pink-500',
  Reviews: 'bg-emerald-500/90 hover:bg-emerald-500',
  Default: 'bg-slate-500/90 hover:bg-slate-500',
}

export default function MeetingBlock({ meeting, slotHeightPx, dayStartMinutes }) {
  const start = toMinutes(meeting.start)
  const end = toMinutes(meeting.end)
  const top = ((start - dayStartMinutes) / 30) * slotHeightPx
  const height = ((end - start) / 30) * slotHeightPx

  const color = typeToColor[meeting.type] || typeToColor.Default

  return (
    <div
      className={`${color} absolute left-1 right-1 rounded-md shadow-sm text-white p-2.5 transition-colors`}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      <div className="text-[11px] font-medium opacity-90">
        {meeting.start} – {meeting.end}
      </div>
      <div className="text-sm font-semibold leading-tight truncate">{meeting.title}</div>
      {meeting.boardNumber && (
        <div className="text-xs opacity-90">Board #{meeting.boardNumber}</div>
      )}
      {meeting.members && meeting.members.length > 0 && (
        <div className="text-[11px] opacity-90 truncate">{meeting.members.join(', ')}</div>
      )}
    </div>
  )
}

function toMinutes(timeStr) {
  // timeStr format: "9:00AM" or "10:30AM" (12-hour)
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i)
  if (!match) return 0
  let hour = parseInt(match[1], 10)
  const minute = parseInt(match[2], 10)
  const period = match[3].toUpperCase()
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  return hour * 60 + minute
}