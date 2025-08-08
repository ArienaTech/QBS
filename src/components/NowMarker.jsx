export default function NowMarker({ topPx, showLabel = true, label = 'Now' }) {
  return (
    <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ top: `${topPx}px` }} aria-hidden="true">
      <div className="relative">
        <div className="absolute -left-1.5 top-[-3px] h-2.5 w-2.5 rounded-full bg-red-600" />
        <div className="border-t-2 border-red-500" />
        {showLabel && (
          <div className="absolute -top-3 left-2 text-[10px] font-medium text-red-600 bg-white/80 px-1 rounded">
            {label}
          </div>
        )}
      </div>
    </div>
  )
}