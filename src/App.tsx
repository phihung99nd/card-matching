import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './index.css'
import Start from '@/pages/Start'
import Game from '@/pages/Game'
import Result from '@/pages/Result'
import CardDex from '@/pages/CardDex'
import { CustomCursor } from '@/components/CustomCursor'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { Switch } from '@/components/ui/switch'
import { Sun, Moon } from 'lucide-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-3">
      <Link className="hover:opacity-90 text-sm sm:text-base text-foreground" to="/">
        Play
      </Link>
      <Link className="hover:opacity-90 text-sm sm:text-base text-foreground" to="/card-dex">
        Card Dex
      </Link>
      <Switch
        checked={theme === "light"}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-slate-700"
        thumbIcon={
          theme === "dark" ? (
            <Moon className="h-3 w-3 text-slate-200" />
          ) : (
            <Sun className="h-3 w-3 text-yellow-900" />
          )
        }
      />
    </div>
  );
}

function AppContent() {
  const isDesktop = useIsDesktop();
  
  return (
    <>
      <Analytics />
      <SpeedInsights />
      {isDesktop && <CustomCursor cursorImage='/cursor/glazed.png' pointerImage='/cursor/glazed-pointer.png'/>}
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
          <header className="px-6 py-4 flex items-center justify-between">
            <Link to="/" className="font-extrabold tracking-tight text-xl sm:text-2xl font-asphalt text-foreground">
              Flip Frenzy
            </Link>
            <nav>
              <ThemeToggle />
            </nav>
          </header>
          <main className="px-4 sm:px-6 lg:px-8 pb-10">
            <Routes>
              <Route path="/" element={<Start />} />
              <Route path="/game" element={<Game />} />
              <Route path="/result" element={<Result />} />
              <Route path="/card-dex" element={<CardDex />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
