import './styles/themes.css'
import './styles/app.css'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LangProvider } from './contexts/LangContext'
import Home from './pages/Home'
import SettingsPage from './pages/Settings'
import WordlePage from './games/wordle/WordlePage'
import ConnectionsPage from './games/connections/ConnectionsPage'
import ComptePage from './games/compte/ComptePage'
import SolitairePage from './games/solitaire/SolitairePage'
import Game2048Page from './games/g2048/Game2048Page'
import HangmanPage from './games/hangman/HangmanPage'
import SnakePage from './games/snake/SnakePage'
import MemoryPage from './games/memory/MemoryPage'
import SudokuPage from './games/sudoku/SudokuPage'
import MinesweeperPage from './games/minesweeper/MinesweeperPage'
import Navbar from './components/Navbar'
import InstallGate from './components/InstallGate'

export default function App() {
  useEffect(() => {
    const handler = e => {
      e.preventDefault()
      window.__pwaPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return (
    <ThemeProvider>
      <LangProvider>
        <BrowserRouter>
          <InstallGate />
          <div className="app-shell">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/wordle" element={<WordlePage />} />
                <Route path="/connections" element={<ConnectionsPage />} />
                <Route path="/compte" element={<ComptePage />} />
                <Route path="/solitaire" element={<SolitairePage />} />
                <Route path="/2048" element={<Game2048Page />} />
                <Route path="/hangman" element={<HangmanPage />} />
                <Route path="/snake" element={<SnakePage />} />
                <Route path="/memory" element={<MemoryPage />} />
                <Route path="/sudoku" element={<SudokuPage />} />
                <Route path="/minesweeper" element={<MinesweeperPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </LangProvider>
    </ThemeProvider>
  )
}
