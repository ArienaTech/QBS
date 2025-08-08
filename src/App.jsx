import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Calendar from './components/Calendar.jsx'
import AddMeetingModal from './components/AddMeetingModal.jsx'

export default function App() {
  const [meetings, setMeetings] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  // Load meetings from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('meetings')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setMeetings(parsed)
        }
      }
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

  function handleAddMeetingClick() {
    setShowAdd(true)
  }

  function handleSaveMeeting(newMeeting) {
    setMeetings((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...newMeeting },
    ])
    setShowAdd(false)
  }

  function handleCancel() {
    setShowAdd(false)
  }

  function toggleSidebar() {
    setSidebarCollapsed((v) => !v)
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={user} />
        <main className="p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4">Parole Board – Meeting Capture</h1>
          <Calendar meetings={meetings} />
        </main>
      </div>

      {showAdd && (
        <AddMeetingModal onSave={handleSaveMeeting} onCancel={handleCancel} />
      )}
    </div>
  )
}
