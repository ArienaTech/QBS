import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import Calendar from './components/Calendar.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="p-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-4">Parole Board – Meeting Capture</h1>
          <Calendar />
        </main>
      </div>
    </div>
  )
}
