import { useState, useCallback } from 'react'
import { useLang } from '../../contexts/LangContext'
import { Bomb, Flag, Smile, Frown, Laugh, Trophy, RotateCcw } from 'lucide-react'

const ROWS = 9, COLS = 9, MINES = 10

function makeBoard(safeIdx) {
  const cells = Array(ROWS * COLS).fill(null).map((_, i) => ({
    mine: false, revealed: false, flagged: false, adj: 0,
  }))

  // Place mines away from first click
  let placed = 0
  while (placed < MINES) {
    const idx = Math.floor(Math.random() * ROWS * COLS)
    if (!cells[idx].mine && idx !== safeIdx) {
      cells[idx].mine = true
      placed++
    }
  }

  // Calculate adjacency
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (cells[r * COLS + c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && cells[nr * COLS + nc].mine) count++
        }
      }
      cells[r * COLS + c].adj = count
    }
  }
  return cells
}

function flood(cells, idx) {
  const visited = new Set()
  const queue = [idx]
  while (queue.length) {
    const cur = queue.shift()
    if (visited.has(cur)) continue
    visited.add(cur)
    if (cells[cur].mine || cells[cur].flagged) continue
    cells[cur].revealed = true
    if (cells[cur].adj === 0) {
      const r = Math.floor(cur / COLS), c = cur % COLS
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) queue.push(nr * COLS + nc)
        }
      }
    }
  }
  return cells
}

const ADJ_COLORS = ['', '#2563eb','#16a34a','#dc2626','#7c3aed','#9f1239','#0891b2','#374151','#6b7280']

export default function MinesweeperPage() {
  const { t } = useLang()
  const [board, setBoard] = useState(null)
  const [status, setStatus] = useState('idle') // idle | playing | won | lost
  const [flags, setFlags] = useState(0)
  const [minePos, setMinePos] = useState([])

  function initAndReveal(idx) {
    const cells = makeBoard(idx)
    const next = flood([...cells.map(c => ({...c}))], idx)
    setBoard(next)
    setStatus('playing')
    setFlags(0)
    setMinePos(cells.map((c, i) => c.mine ? i : -1).filter(i => i !== -1))
    checkWin(next)
  }

  function checkWin(cells) {
    if (cells.every(c => c.mine || c.revealed)) {
      setStatus('won')
    }
  }

  function reveal(idx) {
    if (!board) { initAndReveal(idx); return }
    if (status !== 'playing') return
    const cell = board[idx]
    if (cell.revealed || cell.flagged) return
    if (cell.mine) {
      // Show all mines
      setBoard(prev => prev.map((c, i) => c.mine ? { ...c, revealed: true } : c))
      setStatus('lost')
      return
    }
    const next = flood(board.map(c => ({ ...c })), idx)
    setBoard(next)
    checkWin(next)
  }

  function flag(e, idx) {
    e.preventDefault()
    if (!board || status !== 'playing') return
    const cell = board[idx]
    if (cell.revealed) return
    setBoard(prev => prev.map((c, i) => i === idx ? { ...c, flagged: !c.flagged } : c))
    setFlags(f => board[idx].flagged ? f - 1 : f + 1)
  }

  function restart() {
    setBoard(null)
    setStatus('idle')
    setFlags(0)
    setMinePos([])
  }

  const remaining = MINES - flags

  return (
    <div className="game-page">
      <div className="game-header">
        <span className="game-title"><Bomb size={16} style={{ verticalAlign:'middle', marginRight:4 }} />{t('minesweeperTitle')}</span>
        <button className="btn btn-sm" onClick={restart}>{t('newGame')}</button>
      </div>

      <div className="ms-toolbar">
        <span><Bomb size={14} style={{ verticalAlign:'middle', marginRight:3 }} />{remaining}</span>
        <button className="ms-face" onClick={restart}>
          {status === 'won' ? <Laugh size={20} /> : status === 'lost' ? <Frown size={20} /> : <Smile size={20} />}
        </button>
        <span>{status === 'playing' ? <><Flag size={14} style={{ verticalAlign:'middle', marginRight:3 }} />{flags}</> : ''}</span>
      </div>

      <div className="ms-board" onContextMenu={e => e.preventDefault()}>
        {(board || Array(ROWS * COLS).fill({ mine: false, revealed: false, flagged: false, adj: 0 })).map((cell, idx) => {
          let content = ''
          let cls = 'ms-cell'
          if (cell.revealed) {
            cls += ' revealed'
            if (cell.mine) { content = <Bomb size={14} />; cls += ' mine' }
            else if (cell.adj > 0) content = cell.adj
          } else {
            cls += ' hidden'
            if (cell.flagged) content = <Flag size={14} />
          }
          return (
            <button
              key={idx}
              className={cls}
              onClick={() => reveal(idx)}
              onContextMenu={(e) => flag(e, idx)}
              style={cell.revealed && !cell.mine && cell.adj > 0 ? { color: ADJ_COLORS[cell.adj] } : {}}
            >
              {content}
            </button>
          )
        })}
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 8 }}>{t('minesweeperHint')}</p>

      {(status === 'won' || status === 'lost') && (
        <div className="game-overlay">
          <div className="game-overlay-box">
            <div className="game-overlay-emoji">{status === 'won' ? <Trophy size={40} /> : <Bomb size={40} />}</div>
            <div className="game-overlay-msg">{status === 'won' ? t('win') : t('lose')}</div>
            <button className="btn" onClick={restart}>{t('newGame')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
