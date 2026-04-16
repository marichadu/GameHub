import { useState, useEffect, useCallback, useRef } from 'react'
import { useLang } from '../../contexts/LangContext'
import { Trophy, Skull } from 'lucide-react'

function newBoard() {
  const b = Array(16).fill(0)
  const r1 = addRandom(b)
  return addRandom(r1.board).board
}

// Returns { board, idx } — idx is where the new tile was placed
function addRandom(board) {
  const empty = board.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1)
  if (!empty.length) return { board, idx: -1 }
  const idx = empty[Math.floor(Math.random() * empty.length)]
  const next = [...board]
  next[idx] = Math.random() < 0.9 ? 2 : 4
  return { board: next, idx }
}

function slideRow(row) {
  let r = row.filter(v => v !== 0)
  let score = 0
  for (let i = 0; i < r.length - 1; i++) {
    if (r[i] === r[i + 1]) {
      r[i] *= 2
      score += r[i]
      r[i + 1] = 0
    }
  }
  r = r.filter(v => v !== 0)
  while (r.length < 4) r.push(0)
  return { row: r, score }
}

function move(board, dir) {
  let grid = Array.from({ length: 4 }, (_, i) => board.slice(i * 4, i * 4 + 4))
  let totalScore = 0

  const processRows = (rows) => rows.map(row => {
    const { row: r, score } = slideRow(row)
    totalScore += score
    return r
  })

  let rotated = grid
  // Rotate so we always slide left
  if (dir === 'right') rotated = grid.map(r => [...r].reverse())
  if (dir === 'up') rotated = [0,1,2,3].map(c => grid.map(r => r[c]))
  if (dir === 'down') rotated = [0,1,2,3].map(c => grid.map(r => r[c]).reverse())

  let slid = processRows(rotated)

  // Rotate back
  if (dir === 'right') slid = slid.map(r => [...r].reverse())
  if (dir === 'up') slid = [0,1,2,3].map(c => slid.map(r => r[c]))
  if (dir === 'down') {
    slid = slid.map(r => [...r].reverse())
    slid = [0,1,2,3].map(c => slid.map(r => r[c]))
  }

  const next = slid.flat()
  const changed = next.some((v, i) => v !== board[i])
  return { board: next, score: totalScore, changed }
}

function canMove(board) {
  if (board.includes(0)) return true
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = board[r * 4 + c]
      if (c < 3 && board[r * 4 + c + 1] === v) return true
      if (r < 3 && board[(r + 1) * 4 + c] === v) return true
    }
  }
  return false
}

const TILE_COLORS = null // colors now handled by CSS data-value selectors + themes

export default function Game2048Page() {
  const { t } = useLang()
  const [board, setBoard] = useState(newBoard)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('2048_best') || 0))
  const [over, setOver] = useState(false)
  const [won, setWon] = useState(false)
  // Animation state
  const [spawnIdx, setSpawnIdx] = useState(-1)
  const [mergedIdxs, setMergedIdxs] = useState(new Set())
  const touchStart = useRef(null)

  const doMove = useCallback((dir) => {
    setBoard(prev => {
      const { board: moved, score: gained, changed } = move(prev, dir)
      if (!changed) return prev

      // Detect which positions changed (merged or moved into)
      const newMerged = new Set(
        moved.map((v, i) => (v !== 0 && v !== prev[i]) ? i : -1).filter(i => i !== -1)
      )
      setMergedIdxs(newMerged)

      const { board: withNew, idx: spawnedIdx } = addRandom(moved)
      setSpawnIdx(spawnedIdx)

      setScore(s => {
        const ns = s + gained
        setBest(b => {
          const nb = Math.max(b, ns)
          if (nb > b) localStorage.setItem('2048_best', nb)
          return nb
        })
        return ns
      })
      if (withNew.includes(2048)) setWon(true)
      if (!canMove(withNew)) setOver(true)
      return withNew
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
      if (map[e.key]) { e.preventDefault(); doMove(map[e.key]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doMove])

  const onTouchStart = (e) => { touchStart.current = e.touches[0] }
  const onTouchEnd = (e) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.clientX
    const dy = e.changedTouches[0].clientY - touchStart.current.clientY
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left')
    else doMove(dy > 0 ? 'down' : 'up')
    touchStart.current = null
  }

  function restart() {
    setBoard(newBoard())
    setScore(0)
    setOver(false)
    setWon(false)
    setSpawnIdx(-1)
    setMergedIdxs(new Set())
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <span className="game-title">2048</span>
        <button className="btn btn-sm" onClick={restart}>{t('newGame')}</button>
      </div>

      <div className="g2048-scores">
        <div className="g2048-score-box">
          <div className="g2048-score-label">SCORE</div>
          <div className="g2048-score-val">{score}</div>
        </div>
        <div className="g2048-score-box">
          <div className="g2048-score-label">BEST</div>
          <div className="g2048-score-val">{best}</div>
        </div>
      </div>

      <div
        className="g2048-board"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {board.map((val, i) => {
          const animClass = i === spawnIdx
            ? ' g2048-spawn'
            : mergedIdxs.has(i) ? ' g2048-merge' : ''
          const fontSize = val >= 1000 ? '1.2rem' : val >= 100 ? '1.5rem' : '1.9rem'
          return (
            <div
              key={i}
              className={`g2048-tile${animClass}`}
              data-value={val}
              style={{ fontSize }}
            >
              {val !== 0 ? val : ''}
            </div>
          )
        })}
      </div>

      <p className="g2048-hint">{t('g2048Hint')}</p>

      {(over || won) && (
        <div className="game-overlay">
          <div className="game-overlay-box">
            <div className="game-overlay-emoji">{won ? <Trophy size={40} /> : <Skull size={40} />}</div>
            <div className="game-overlay-msg">{won ? t('g2048Win') : t('lose')}</div>
            <div style={{ marginBottom: 8, color: 'var(--text2)' }}>Score: {score}</div>
            <button className="btn" onClick={restart}>{t('newGame')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
