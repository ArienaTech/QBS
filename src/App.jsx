import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Calendar from './components/Calendar.jsx'
import AddMeetingModal from './components/AddMeetingModal.jsx'

export default function App() {
  const [meetings, setMeetings] = useState([])
  const [showAdd, setShowAdd] = useState(false)

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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onAddMeeting={handleAddMeetingClick} />
        <main className="p-6">
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
