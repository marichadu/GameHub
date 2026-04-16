import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const THEMES = ['default', 'ocean', 'forest', 'sunset', 'candy']

// Dark between 20:00 and 07:00
function isNightTime() {
  const h = new Date().getHours()
  return h >= 20 || h < 7
}

// darkMode: 'auto' | 'light' | 'dark'
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'default')
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') || 'auto'
  )

  // Compute the actual dark boolean
  const dark = darkMode === 'dark' ? true : darkMode === 'light' ? false : isNightTime()

  // Apply to DOM whenever dark or theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-dark', String(dark))
    localStorage.setItem('theme', theme)
  }, [theme, dark])

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // In 'auto' mode, re-check every minute so the switch happens at the boundary
  useEffect(() => {
    if (darkMode !== 'auto') return
    const id = setInterval(() => {
      // Force a re-render by nudging state — dark is recomputed from isNightTime()
      document.documentElement.setAttribute('data-dark', String(isNightTime()))
    }, 60_000)
    return () => clearInterval(id)
  }, [darkMode])

  // Backwards-compat: expose `setDark` so Settings toggle still works
  function setDark(val) {
    setDarkMode(val ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, dark, setDark, darkMode, setDarkMode, THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
