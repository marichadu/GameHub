import { useState, useEffect } from 'react'
import { useLang } from '../../contexts/LangContext'

// 5 puzzles (puzzle + solution)
const PUZZLES = [
  {
    puzzle: [
      5,3,0, 0,7,0, 0,0,0,
      6,0,0, 1,9,5, 0,0,0,
      0,9,8, 0,0,0, 0,6,0,
      8,0,0, 0,6,0, 0,0,3,
      4,0,0, 8,0,3, 0,0,1,
      7,0,0, 0,2,0, 0,0,6,
      0,6,0, 0,0,0, 2,8,0,
      0,0,0, 4,1,9, 0,0,5,
      0,0,0, 0,8,0, 0,7,9,
    ],
    solution: [
      5,3,4, 6,7,8, 9,1,2,
      6,7,2, 1,9,5, 3,4,8,
      1,9,8, 3,4,2, 5,6,7,
      8,5,9, 7,6,1, 4,2,3,
      4,2,6, 8,5,3, 7,9,1,
      7,1,3, 9,2,4, 8,5,6,
      9,6,1, 5,3,7, 2,8,4,
      2,8,7, 4,1,9, 6,3,5,
      3,4,5, 2,8,6, 1,7,9,
    ],
  },
  {
    puzzle: [
      0,0,0, 2,6,0, 7,0,1,
      6,8,0, 0,7,0, 0,9,0,
      1,9,0, 0,0,4, 5,0,0,
      8,2,0, 1,0,0, 0,4,0,
      0,0,4, 6,0,2, 9,0,0,
      0,5,0, 0,0,3, 0,2,8,
      0,0,9, 3,0,0, 0,7,4,
      0,4,0, 0,5,0, 0,3,6,
      7,0,3, 0,1,8, 0,0,0,
    ],
    solution: [
      4,3,5, 2,6,9, 7,8,1,
      6,8,2, 5,7,1, 4,9,3,
      1,9,7, 8,3,4, 5,6,2,
      8,2,6, 1,9,5, 3,4,7,
      3,7,4, 6,8,2, 9,1,5,
      9,5,1, 7,4,3, 6,2,8,
      5,1,9, 3,2,6, 8,7,4,
      2,4,8, 9,5,7, 1,3,6,
      7,6,3, 4,1,8, 2,5,9,
    ],
  },
  {
    puzzle: [
      0,0,0, 6,0,0, 4,0,0,
      7,0,0, 0,3,5, 6,0,0,
      0,0,0, 0,0,0, 0,1,0,
      0,2,0, 0,7,4, 0,0,0,
      0,0,0, 0,0,0, 0,0,0,
      0,0,0, 5,2,0, 0,9,0,
      0,5,0, 0,0,0, 0,0,0,
      0,0,7, 4,1,0, 0,0,8,
      0,0,3, 0,0,8, 0,0,0,
    ],
    solution: [
      5,8,1, 6,9,7, 4,2,3,
      7,9,2, 8,3,5, 6,4,1,
      3,6,4, 2,1,8, 9,1,7,
      8,2,9, 1,7,4, 3,5,6,
      4,1,5, 9,6,3, 8,7,2,
      6,7,3, 5,2,1, 7,9,4,
      2,5,8, 7,4,6, 1,3,9,
      9,4,7, 4,1,2, 5,6,8,
      1,6,3, 3,5,8, 2,8,5,
    ],
  },
  {
    puzzle: [
      0,2,0, 0,0,0, 0,0,0,
      0,0,0, 6,0,0, 0,0,3,
      0,7,4, 0,8,0, 0,0,0,
      0,0,0, 0,0,3, 0,0,2,
      0,8,0, 0,4,0, 0,1,0,
      6,0,0, 5,0,0, 0,0,0,
      0,0,0, 0,1,0, 7,8,0,
      5,0,0, 0,0,9, 0,0,0,
      0,0,0, 0,0,0, 0,4,0,
    ],
    solution: [
      1,2,6, 4,3,7, 9,5,8,
      8,9,5, 6,2,1, 4,7,3,
      3,7,4, 9,8,5, 1,2,6,
      4,5,7, 1,9,3, 8,6,2,
      9,8,3, 2,4,6, 5,1,7,
      6,1,2, 5,7,8, 3,9,4,
      2,6,9, 3,1,4, 7,8,5,
      5,4,8, 7,6,9, 2,3,1,
      7,3,1, 8,5,2, 6,4,9,
    ],
  },
  {
    puzzle: [
      0,0,0, 0,0,0, 2,0,0,
      0,8,0, 0,0,7, 0,9,0,
      6,0,2, 0,0,0, 5,0,0,
      0,7,0, 0,6,0, 0,0,0,
      0,0,0, 9,0,1, 0,0,0,
      0,0,0, 0,2,0, 0,4,0,
      0,0,5, 0,0,0, 6,0,3,
      0,9,0, 4,0,0, 0,7,0,
      0,0,6, 0,0,0, 0,0,0,
    ],
    solution: [
      9,5,7, 6,4,3, 2,8,1,
      1,8,3, 2,5,7, 4,9,6,
      6,4,2, 1,9,8, 5,3,7,
      5,7,4, 3,6,2, 9,1,8,
      2,6,8, 9,7,1, 3,5,4,
      3,1,9, 8,2,5, 7,4,6,
      4,2,5, 7,8,9, 6,1,3,
      8,9,1, 4,3,6, 2,7,5,
      7,3,6, 5,1,4, 8,2,9,
    ],
  },
]

function isConflict(grid, idx, val) {
  if (val === 0) return false
  const row = Math.floor(idx / 9)
  const col = idx % 9
  const boxR = Math.floor(row / 3) * 3
  const boxC = Math.floor(col / 3) * 3
  for (let i = 0; i < 9; i++) {
    if (i !== col && grid[row * 9 + i] === val) return true
    if (i !== row && grid[i * 9 + col] === val) return true
    const br = boxR + Math.floor(i / 3)
    const bc = boxC + (i % 3)
    if (br * 9 + bc !== idx && grid[br * 9 + bc] === val) return true
  }
  return false
}

export default function SudokuPage() {
  const { t } = useLang()
  const [puzzleIdx] = useState(() => Math.floor(Math.random() * PUZZLES.length))
  const { puzzle, solution } = PUZZLES[puzzleIdx]
  const [grid, setGrid] = useState([...puzzle])
  const [selected, setSelected] = useState(null)
  const [won, setWon] = useState(false)
  const [errors, setErrors] = useState(0)

  function checkWin(g) {
    return g.every((v, i) => v === solution[i])
  }

  function setCell(val) {
    if (selected === null || puzzle[selected] !== 0) return
    const next = [...grid]
    next[selected] = val
    setGrid(next)
    if (val !== 0 && val !== solution[selected]) {
      setErrors(e => e + 1)
    }
    if (checkWin(next)) setWon(true)
  }

  function newGame() {
    const idx = Math.floor(Math.random() * PUZZLES.length)
    setGrid([...PUZZLES[idx].puzzle])
    setSelected(null)
    setWon(false)
    setErrors(0)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (selected === null) return
      if (e.key >= '1' && e.key <= '9') setCell(Number(e.key))
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') setCell(0)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, grid])

  const selRow = selected !== null ? Math.floor(selected / 9) : -1
  const selCol = selected !== null ? selected % 9 : -1
  const selBox = selected !== null ? Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3) : -1

  return (
    <div className="game-page">
      <div className="game-header">
        <span className="game-title">🔢 {t('sudokuTitle')}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>✗ {errors}</span>
          <button className="btn btn-sm" onClick={newGame}>{t('newGame')}</button>
        </div>
      </div>

      <div className="sudoku-board">
        {grid.map((val, idx) => {
          const row = Math.floor(idx / 9)
          const col = idx % 9
          const box = Math.floor(row / 3) * 3 + Math.floor(col / 3)
          const isFixed = puzzle[idx] !== 0
          const isSelected = selected === idx
          const isHighlight = row === selRow || col === selCol || box === selBox
          const isError = !isFixed && val !== 0 && val !== solution[idx]
          const conflict = !isFixed && !isError && isConflict(grid, idx, val)
          return (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={[
                'sudoku-cell',
                isFixed ? 'fixed' : '',
                isSelected ? 'selected' : '',
                isHighlight && !isSelected ? 'highlight' : '',
                isError ? 'error' : '',
                conflict ? 'conflict' : '',
                col === 2 || col === 5 ? 'border-right' : '',
                row === 2 || row === 5 ? 'border-bottom' : '',
              ].filter(Boolean).join(' ')}
            >
              {val !== 0 ? val : ''}
            </button>
          )
        })}
      </div>

      <div className="sudoku-numpad">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} className="sudoku-num-btn" onClick={() => setCell(n)}>{n}</button>
        ))}
        <button className="sudoku-num-btn erase" onClick={() => setCell(0)}>⌫</button>
      </div>

      {won && (
        <div className="game-overlay">
          <div className="game-overlay-box">
            <div className="game-overlay-emoji"><Trophy size={40} /></div>
            <div className="game-overlay-msg">{t('win')}</div>
            {errors > 0 && <div style={{ color: 'var(--text2)', marginBottom: 4 }}>Errors: {errors}</div>}
            <button className="btn" onClick={newGame}>{t('newGame')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
