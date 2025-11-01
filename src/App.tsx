import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './index.css'
import Start from '@/pages/Start'
import Game from '@/pages/Game'
import Result from '@/pages/Result'
import { CustomCursor } from '@/components/CustomCursor'

function App() {
  return (
    <BrowserRouter>
      <CustomCursor cursorImage='/cursor/glazed.png' pointerImage='/cursor/glazed-pointer.png'/>
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
        <header className="px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-extrabold tracking-tight text-xl sm:text-2xl font-asphalt">
            Flip Frenzy
          </Link>
          <nav className="text-sm sm:text-base">
            <Link className="hover:opacity-90" to="/">Start</Link>
          </nav>
        </header>
        <main className="px-4 sm:px-6 lg:px-8 pb-10">
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/game" element={<Game />} />
            <Route path="/result" element={<Result />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
