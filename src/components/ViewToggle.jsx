export default function ViewToggle({ value, onChange }) {
  const options = [
    { key: 'day', label: 'Day' },
    { key: 'workweek', label: 'Work Week' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
  ]

  return (
    <div className="inline-flex items-center rounded-md border border-slate-300 bg-white shadow-sm overflow-hidden">
      {options.map((opt, idx) => {
        const isActive = value === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange?.(opt.key)}
            className={`px-2.5 py-1.5 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'} ${idx !== options.length - 1 ? 'border-r border-slate-300' : ''}`}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}