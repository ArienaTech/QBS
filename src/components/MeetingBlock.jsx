const typeToColor = {
  General: 'bg-blue-600/90 hover:bg-blue-600',
  Suspensions: 'bg-pink-500/90 hover:bg-pink-500',
  Reviews: 'bg-emerald-500/90 hover:bg-emerald-500',
  Default: 'bg-slate-500/90 hover:bg-slate-500',
}

export default function MeetingBlock({ meeting, slotHeightPx, dayStartMinutes }) {
  const top = ((meeting.startMinutes - dayStartMinutes) / 30) * slotHeightPx
  const height = ((meeting.endMinutes - meeting.startMinutes) / 30) * slotHeightPx

  const color = typeToColor[meeting.type] || typeToColor.Default

  return (
    <div
      className={`${color} absolute left-1 right-1 rounded-md shadow-sm text-white p-2.5 transition-colors`}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      <div className="text-[11px] font-medium opacity-90">
        {format12Hour(meeting.startMinutes)} – {format12Hour(meeting.endMinutes)}
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

function format12Hour(total) {
  const hours24 = Math.floor(total / 60)
  const minutes = total % 60
  const period = hours24 >= 12 ? 'PM' : 'AM'
  let hour12 = hours24 % 12
  if (hour12 === 0) hour12 = 12
  return `${hour12}:${minutes.toString().padStart(2, '0')}${period}`
}