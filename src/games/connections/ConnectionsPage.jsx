import { useState, useEffect } from 'react'
import { useLang } from '../../contexts/LangContext'
import { getRandomPuzzle } from './data'
import { X, RotateCcw } from 'lucide-react'

const MAX_MISTAKES = 4

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ConnectionsPage() {
  const { lang, t } = useLang()
  const [puzzle, setPuzzle] = useState(null)
  const [tiles, setTiles] = useState([])
  const [selected, setSelected] = useState([])
  const [solved, setSolved] = useState([]) // solved group indices
  const [mistakes, setMistakes] = useState(0)
  const [status, setStatus] = useState('playing')
  const [toast, setToast] = useState(null)

  function init(p) {
    const allWords = shuffle(p.groups.flatMap(g => g.words))
    setTiles(allWords)
    setSelected([])
    setSolved([])
    setMistakes(0)
    setStatus('playing')
  }

  function newGame() {
    const p = getRandomPuzzle(lang)
    setPuzzle(p)
    init(p)
  }

  useEffect(() => { newGame() }, [lang])

  function showToast(msg, dur = 1800) {
    setToast(msg)
    setTimeout(() => setToast(null), dur)
  }

  function toggleSelect(word) {
    if (status !== 'playing') return
    setSelected(prev =>
      prev.includes(word) ? prev.filter(w => w !== word) : prev.length < 4 ? [...prev, word] : prev
    )
  }

  function handleSubmit() {
    if (selected.length !== 4) return
    // Check if selected matches any unsolved group
    const matchIdx = puzzle.groups.findIndex((g, i) => {
      if (solved.includes(i)) return false
      return g.words.every(w => selected.includes(w)) && selected.every(w => g.words.includes(w))
    })

    if (matchIdx !== -1) {
      const newSolved = [...solved, matchIdx]
      setSolved(newSolved)
      setSelected([])
      if (newSolved.length === puzzle.groups.length) {
        setStatus('won')
        showToast(t('connectionsWin'), 3000)
      }
    } else {
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)
      setSelected([])
      if (newMistakes >= MAX_MISTAKES) {
        setStatus('lost')
        showToast(t('connectionsLose'), 3000)
      } else {
        showToast(`${MAX_MISTAKES - newMistakes} ${t('connectionsLeft')}`)
      }
    }
  }

  function doShuffle() {
    if (!puzzle) return
    const remaining = tiles.filter(w =>
      !puzzle.groups.some((g, i) => solved.includes(i) && g.words.includes(w))
    )
    const solvedWords = tiles.filter(w =>
      puzzle.groups.some((g, i) => solved.includes(i) && g.words.includes(w))
    )
    setTiles([...solvedWords, ...shuffle(remaining)])
  }

  if (!puzzle) return null

  const solvedWords = new Set(
    puzzle.groups.flatMap((g, i) => solved.includes(i) ? g.words : [])
  )

  return (
    <div className="game-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="game-header" style={{ maxWidth: 480 }}>
        <span className="game-title">{t('connectionsTitle')}</span>
        <button className="btn btn-ghost btn-sm" onClick={newGame}>{t('newGame')}</button>
      </div>

      {/* Lives */}
      <div className="conn-lives">
        {Array.from({ length: MAX_MISTAKES }, (_, i) => (
          <div key={i} className={`conn-life${i < mistakes ? ' lost' : ''}`} />
        ))}
      </div>

      {/* Grid */}
      <div className="connections-grid">
        {/* Solved rows */}
        {solved.map(idx => {
          const g = puzzle.groups[idx]
          return (
            <div key={idx} className="conn-solved-row" style={{ background: g.color }}>
              <div style={{ fontSize: '0.7rem', marginBottom: 2 }}>{g.label}</div>
              <div>{g.words.join(' · ')}</div>
            </div>
          )
        })}

        {/* Remaining tiles */}
        {tiles
          .filter(w => !solvedWords.has(w))
          .map(word => (
            <div
              key={word}
              className={`conn-tile${selected.includes(word) ? ' selected' : ''}`}
              onClick={() => toggleSelect(word)}
            >
              {word}
            </div>
          ))
        }
      </div>

      {/* Actions */}
      <div className="conn-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>{t('connectionsDeselect')}</button>
        <button className="btn btn-ghost btn-sm" onClick={doShuffle}>{t('connectionsShuffle')}</button>
        <button
          className="btn btn-sm"
          onClick={handleSubmit}
          disabled={selected.length !== 4 || status !== 'playing'}
          style={{ opacity: selected.length !== 4 ? 0.5 : 1 }}
        >
          {t('connectionsSubmit')} ({selected.length}/4)
        </button>
      </div>

      {status !== 'playing' && (
        <button className="btn" style={{ marginTop: 12 }} onClick={newGame}>
          <RotateCcw size={15} style={{ verticalAlign:'middle', marginRight:5 }} />{t('newGame')}
        </button>
      )}
    </div>
  )
}
