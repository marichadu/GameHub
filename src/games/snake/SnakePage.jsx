import { useState, useEffect, useRef, useCallback } from 'react'
import { useLang } from '../../contexts/LangContext'

const COLS = 20
const ROWS = 20
const CELL = 18
const TICK = 130

const DIR = {
  UP:    { x: 0,  y: -1 },
  DOWN:  { x: 0,  y: 1  },
  LEFT:  { x: -1, y: 0  },
  RIGHT: { x: 1,  y: 0  },
}

function randFood(snake) {
  let pos
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some(s => s.x === pos.x && s.y === pos.y))
  return pos
}

function initState() {
  const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
  return { snake, food: randFood(snake), dir: DIR.RIGHT, nextDir: DIR.RIGHT, score: 0, status: 'idle' }
}

export default function SnakePage() {
  const { t } = useLang()
  const [state, setState] = useState(initState)
  const stateRef = useRef(state)
  stateRef.current = state
  const tickRef = useRef(null)
  const canvasRef = useRef(null)

  const best = Number(localStorage.getItem('snake_best') || 0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { snake, food } = stateRef.current
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f9f9f9'
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6366f1'
    const surface2 = getComputedStyle(document.documentElement).getPropertyValue('--surface2').trim() || '#e5e7eb'

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

    // Grid
    ctx.strokeStyle = surface2
    ctx.lineWidth = 0.3
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke() }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke() }

    // Food
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 1, 0, Math.PI * 2)
    ctx.fill()

    // Snake
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? accent : accent + 'cc'
      const r = i === 0 ? 5 : 3
      ctx.beginPath()
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, r)
      ctx.fill()
    })
  }, [])

  const tick = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'running') return prev
      const dir = prev.nextDir
      const head = { x: prev.snake[0].x + dir.x, y: prev.snake[0].y + dir.y }

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
          prev.snake.some(s => s.x === head.x && s.y === head.y)) {
        const s = prev.score
        if (s > Number(localStorage.getItem('snake_best') || 0)) localStorage.setItem('snake_best', s)
        return { ...prev, status: 'over' }
      }

      const ateFood = head.x === prev.food.x && head.y === prev.food.y
      const newSnake = [head, ...prev.snake.slice(0, ateFood ? undefined : -1)]
      const newFood = ateFood ? randFood(newSnake) : prev.food
      return { ...prev, snake: newSnake, food: newFood, dir, score: prev.score + (ateFood ? 10 : 0) }
    })
    draw()
  }, [draw])

  useEffect(() => {
    draw()
  }, [state, draw])

  useEffect(() => {
    if (state.status === 'running') {
      tickRef.current = setInterval(tick, TICK)
    } else {
      clearInterval(tickRef.current)
    }
    return () => clearInterval(tickRef.current)
  }, [state.status, tick])

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: DIR.UP, ArrowDown: DIR.DOWN, ArrowLeft: DIR.LEFT, ArrowRight: DIR.RIGHT,
        w: DIR.UP, s: DIR.DOWN, a: DIR.LEFT, d: DIR.RIGHT,
      }
      const d = map[e.key]
      if (!d) return
      e.preventDefault()
      setState(prev => {
        if (prev.status === 'idle') return { ...prev, status: 'running', nextDir: d }
        // Prevent 180 turns
        if (d.x === -prev.dir.x && d.y === -prev.dir.y) return prev
        return { ...prev, nextDir: d }
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Touch swipe
  const touchStart = useRef(null)
  const onTouchStart = (e) => { touchStart.current = e.touches[0] }
  const onTouchEnd = (e) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.clientX
    const dy = e.changedTouches[0].clientY - touchStart.current.clientY
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) {
      // Tap — start/restart
      if (state.status === 'idle') setState(prev => ({ ...prev, status: 'running' }))
      return
    }
    let d
    if (Math.abs(dx) > Math.abs(dy)) d = dx > 0 ? DIR.RIGHT : DIR.LEFT
    else d = dy > 0 ? DIR.DOWN : DIR.UP
    setState(prev => {
      if (prev.status === 'idle') return { ...prev, status: 'running', nextDir: d }
      if (d.x === -prev.dir.x && d.y === -prev.dir.y) return prev
      return { ...prev, nextDir: d }
    })
    touchStart.current = null
  }

  function restart() {
    setState(initState())
    setTimeout(() => setState(prev => ({ ...prev, status: 'running' })), 50)
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <span className="game-title">🐍 {t('snakeTitle')}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Best: {best}</span>
          <button className="btn btn-sm" onClick={restart}>{t('newGame')}</button>
        </div>
      </div>

      <div className="snake-score">Score: {state.score}</div>

      <div
        className="snake-canvas-wrap"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="snake-canvas"
        />
        {state.status === 'idle' && (
          <div className="snake-overlay">
            <div>{t('snakeStart')}</div>
            <div style={{ fontSize: '0.8rem', marginTop: 6, opacity: 0.7 }}>{t('snakeHint')}</div>
          </div>
        )}
        {state.status === 'over' && (
          <div className="snake-overlay">
            <div>💀 {t('lose')}</div>
            <div style={{ margin: '8px 0' }}>Score: {state.score}</div>
            <button className="btn btn-sm" onClick={restart}>{t('newGame')}</button>
          </div>
        )}
      </div>

      <div className="snake-dpad">
        <div />
        <button className="dpad-btn" onClick={() => setState(p => ({ ...p, status: p.status === 'idle' ? 'running' : p.status, nextDir: DIR.UP }))}>▲</button>
        <div />
        <button className="dpad-btn" onClick={() => setState(p => ({ ...p, status: p.status === 'idle' ? 'running' : p.status, nextDir: DIR.LEFT }))}>◀</button>
        <div className="dpad-center" />
        <button className="dpad-btn" onClick={() => setState(p => ({ ...p, status: p.status === 'idle' ? 'running' : p.status, nextDir: DIR.RIGHT }))}>▶</button>
        <div />
        <button className="dpad-btn" onClick={() => setState(p => ({ ...p, status: p.status === 'idle' ? 'running' : p.status, nextDir: DIR.DOWN }))}>▼</button>
        <div />
      </div>
    </div>
  )
}
