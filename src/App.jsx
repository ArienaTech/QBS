import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Calendar from './components/Calendar.jsx'
import AddMeetingModal from './components/AddMeetingModal.jsx'
import ViewToggle from './components/ViewToggle.jsx'
import DateNav from './components/DateNav.jsx'

function formatISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function App() {
  const [meetings, setMeetings] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [calendarView, setCalendarView] = useState('workweek')
  const [currentDateISO, setCurrentDateISO] = useState(formatISO(new Date()))

  const user = { name: 'Alex Johnson', email: 'alex.johnson@example.gov.au' }

  // Initialize collapsed state from localStorage or screen width
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed')
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true')
      } else {
        const prefersCollapsed = window.matchMedia('(max-width: 1024px)').matches
        setSidebarCollapsed(prefersCollapsed)
      }
    } catch {}
  }, [])

  // Load meetings and calendar prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem('meetings')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setMeetings(parsed)
        }
      }
      const viewRaw = localStorage.getItem('calendarView')
      if (viewRaw) setCalendarView(viewRaw)
      const dateRaw = localStorage.getItem('calendarCurrentDate')
      if (dateRaw) setCurrentDateISO(dateRaw)
    } catch {}
  }, [])

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed))
    } catch {}
  }, [sidebarCollapsed])

  // Persist meetings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('meetings', JSON.stringify(meetings))
    } catch {}
  }, [meetings])

  // Persist calendar view/date
  useEffect(() => { try { localStorage.setItem('calendarView', calendarView) } catch {} }, [calendarView])
  useEffect(() => { try { localStorage.setItem('calendarCurrentDate', currentDateISO) } catch {} }, [currentDateISO])

  function handleAddMeetingClick() { setShowAdd(true) }

  function handleSaveMeeting(newMeeting) {
    setMeetings((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...newMeeting }])
    setShowAdd(false)
  }

  function handleCancel() { setShowAdd(false) }

  function toggleSidebar() { setSidebarCollapsed((v) => !v) }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={user} />
        <main className="p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">Meeting Capture</h1>
            <div className="flex items-center gap-2">
              <DateNav view={calendarView} currentDateISO={currentDateISO} onChange={setCurrentDateISO} />
              <ViewToggle value={calendarView} onChange={setCalendarView} />
              <button
                onClick={handleAddMeetingClick}
                aria-label="Add meeting"
                aria-haspopup="dialog"
                aria-controls="add-meeting-modal"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-md shadow-sm transition-colors"
              >
                <span>Add Meeting</span>
              </button>
            </div>
          </div>
          <Calendar meetings={meetings} view={calendarView} currentDateISO={currentDateISO} onChangeDate={setCurrentDateISO} />
        </main>
      </div>

      {showAdd && (
        <AddMeetingModal onSave={handleSaveMeeting} onCancel={handleCancel} defaultDate={currentDateISO} />
      )}
    </div>
  )
}
