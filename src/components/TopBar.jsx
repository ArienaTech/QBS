export default function TopBar({ onAddMeeting }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <div className="h-16 flex items-center justify-between px-4 md:px-6">
        <div className="text-base md:text-lg font-semibold text-slate-800">Queensland Corrective Services</div>
        <button
          onClick={onAddMeeting}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-md shadow-sm transition-colors"
        >
          <span>Add Meeting</span>
        </button>
      </div>
    </header>
  )
}