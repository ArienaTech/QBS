import { useState } from 'react'

const dayOptions = [
  { value: 0, label: 'Monday (04/08)' },
  { value: 1, label: 'Tuesday (05/08)' },
  { value: 2, label: 'Wednesday (06/08)' },
  { value: 3, label: 'Thursday (07/08)' },
  { value: 4, label: 'Friday (08/08)' },
]

const typeOptions = ['General', 'Suspensions', 'Reviews']

export default function AddMeetingModal({ onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const [dayIndex, setDayIndex] = useState(0)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [type, setType] = useState('General')
  const [boardNumber, setBoardNumber] = useState('')
  const [members, setMembers] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const startMinutes = parseTimeToMinutes(start)
    const endMinutes = parseTimeToMinutes(end)
    if (!title || endMinutes <= startMinutes) return
    const meeting = {
      title,
      dayIndex: Number(dayIndex),
      startMinutes,
      endMinutes,
      type,
      boardNumber: boardNumber.trim() || undefined,
      members: members
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
    }
    onSave(meeting)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Add Meeting</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Day</label>
              <select
                value={dayIndex}
                onChange={(e) => setDayIndex(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dayOptions.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                step={1800}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                step={1800}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Board Number (optional)</label>
              <input
                type="text"
                value={boardNumber}
                onChange={(e) => setBoardNumber(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Members (comma-separated)</label>
              <input
                type="text"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Smith, Nguyen, Taylor"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white">Save Meeting</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function parseTimeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10))
  return h * 60 + m
}