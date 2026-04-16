import { useState, useEffect } from 'react'
import { Brain, Clock, Trophy, Star } from 'lucide-react'
import { useLang } from '../../contexts/LangContext'

const EMOJIS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯']

const LEVELS = [
  { id: 1, cols: 3, rows: 4, pairs: 6  },
  { id: 2, cols: 4, rows: 4, pairs: 8  },
  { id: 3, cols: 4, rows: 5, pairs: 10 },
]

const LEVEL_LABELS = {
  1: { fr: 'Facile',    en: 'Easy'   },
  2: { fr: 'Moyen',    en: 'Medium' },
  3: { fr: 'Difficile', en: 'Hard'   },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeCards(pairs) {
  const pool = shuffle(EMOJIS).slice(0, pairs)
  return shuffle([...pool, ...pool]).map((emoji, id) => ({ id, emoji, flipped: false, matched: false }))
}

export default function MemoryPage() {
  const { t, lang } = useLang()
  const [level, setLevel] = useState(null)
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [won, setWon] = useState(false)
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)

  const cfg = LEVELS.find(l => l.id === level)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTime(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setWon(true)
      setRunning(false)
    }
  }, [cards])

  function startLevel(lvl) {
    const c = LEVELS.find(l => l.id === lvl)
    setLevel(lvl)
    setCards(makeCards(c.pairs))
    setSelected([])
    setMoves(0)
    setLocked(false)
    setWon(false)
    setTime(0)
    setRunning(false)
  }

  function flip(idx) {
    if (locked || cards[idx].flipped || cards[idx].matched) return
    if (!running) setRunning(true)
    const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c)
    const newSel = [...selected, idx]
    setCards(newCards)
    setSelected(newSel)
    if (newSel.length === 2) {
      setLocked(true)
      setMoves(m => m + 1)
      const [a, b] = newSel
      if (newCards[a].emoji === newCards[b].emoji) {
        setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, matched: true } : c))
        setSelected([])
        setLocked(false)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, flipped: false } : c))
          setSelected([])
          setLocked(false)
        }, 900)
      }
    }
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── Level picker ─────────────────────────────────────────────────────────
  if (level === null) {
    return (
      <div className="game-page">
        <div className="game-header" style={{ marginBottom: 24 }}>
          <span className="game-title">
            <Brain size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {t('memoryTitle')}
          </span>
        </div>
        <div className="memory-level-pick">
          {LEVELS.map(lvl => (
            <button key={lvl.id} className="memory-level-btn" onClick={() => startLevel(lvl.id)}>
              <div className="memory-level-stars">
                {Array.from({ length: lvl.id }, (_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <div className="memory-level-name">{LEVEL_LABELS[lvl.id][lang]}</div>
              <div className="memory-level-sub">{lvl.pairs} {t('memoryPairs')}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Game ──────────────────────────────────────────────────────────────────
  return (
    <div className="game-page memory-page">
      <div className="game-header">
        <span className="game-title">
          <Brain size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {t('memoryTitle')}
          <span style={{ fontWeight: 400, fontSize: '0.85em', marginLeft: 6, color: 'var(--text2)' }}>
            {LEVEL_LABELS[level][lang]}
          </span>
        </span>
        <button className="btn btn-sm" onClick={() => setLevel(null)}>{t('memoryChangeLevel')}</button>
      </div>

      <div className="memory-stats">
        <div className="memory-stat">
          <span className="memory-stat-label">{t('score')}</span>
          <span>{moves}</span>
        </div>
        <div className="memory-stat">
          <span className="memory-stat-label"><Clock size={13} /></span>
          <span>{fmt(time)}</span>
        </div>
        <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => startLevel(level)}>
          {t('newGame')}
        </button>
      </div>

      <div className="memory-grid" data-cols={cfg.cols} data-rows={cfg.rows}>
        {cards.map((card, i) => (
          <button
            key={card.id}
            className={`memory-card${card.flipped || card.matched ? ' flipped' : ''}${card.matched ? ' matched' : ''}`}
            onClick={() => flip(i)}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front">❓</div>
              <div className="memory-card-back">{card.emoji}</div>
            </div>
          </button>
        ))}
      </div>

      {won && (
        <div className="game-overlay">
          <div className="game-overlay-box">
            <div className="game-overlay-emoji"><Trophy size={40} /></div>
            <div className="game-overlay-msg">{t('win')}</div>
            <div style={{ color: 'var(--text2)', marginBottom: 12 }}>
              {moves} {t('attempts')} · {fmt(time)}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {level < 3 && (
                <button className="btn" onClick={() => startLevel(level + 1)}>
                  {t('memoryNextLevel')}
                </button>
              )}
              <button className="btn btn-sm" onClick={() => startLevel(level)}>{t('newGame')}</button>
              <button className="btn btn-sm" onClick={() => setLevel(null)}>{t('memoryChangeLevel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
