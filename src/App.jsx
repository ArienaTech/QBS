import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Calendar from './components/Calendar.jsx'
import AddMeetingModal from './components/AddMeetingModal.jsx'

export default function App() {
  const [meetings, setMeetings] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Initialize collapsed state from localStorage or screen width
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed')
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true')
        return
      }
      const prefersCollapsed = window.matchMedia('(max-width: 1024px)').matches
      setSidebarCollapsed(prefersCollapsed)
    } catch {}
  }, [])

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed))
    } catch {}
  }, [sidebarCollapsed])

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
        <TopBar onAddMeeting={handleAddMeetingClick} />
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
