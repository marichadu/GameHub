import { useState, useEffect, useCallback } from 'react'
import { useLang } from '../../contexts/LangContext'
import { RotateCcw, Delete } from 'lucide-react'
import { getRandomWord, isValidWord, injectWordList, getWordCount } from './words'
import { fetchWordList } from './wordLoader'

const WORD_LENGTH = 5
const MAX_GUESSES = 6

const KEYBOARD_ROWS_FR = [
  ['A','Z','E','R','T','Y','U','I','O','P'],
  ['Q','S','D','F','G','H','J','K','L','M'],
  ['ENTER','W','X','C','V','B','N','⌫'],
]
const KEYBOARD_ROWS_EN = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

function evaluateGuess(guess, target) {
  const result = Array(WORD_LENGTH).fill('absent')
  const targetArr = target.split('')
  const guessArr = guess.split('')
  const used = Array(WORD_LENGTH).fill(false)

  // First pass: correct
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct'
      used[i] = true
    }
  }
  // Second pass: present
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guessArr[i] === targetArr[j]) {
        result[i] = 'present'
        used[j] = true
        break
      }
    }
  }
  return result
}

export default function WordlePage() {
  const { lang, t } = useLang()
  const [target, setTarget] = useState(() => getRandomWord(lang))
  const [guesses, setGuesses] = useState([]) // [{word, result}]
  const [current, setCurrent] = useState('')
  const [status, setStatus] = useState('playing') // playing | won | lost
  const [toast, setToast] = useState(null)
  const [shake, setShake] = useState(false)
  const [letterStates, setLetterStates] = useState({})
  const [validating, setValidating] = useState(false) // API call in flight
  const [wordCount, setWordCount] = useState(() => getWordCount(lang))
  const [loadingWords, setLoadingWords] = useState(false)

  // Fetch external word list on mount and when language changes
  useEffect(() => {
    let cancelled = false
    setLoadingWords(true)
    fetchWordList(lang).then(words => {
      if (cancelled) return
      if (words) {
        injectWordList(lang, words)
        setWordCount(getWordCount(lang))
      }
      setLoadingWords(false)
    })
    return () => { cancelled = true }
  }, [lang])

  function showToast(msg, duration = 1800) {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }

  function newGame() {
    setTarget(getRandomWord(lang))
    setGuesses([])
    setCurrent('')
    setStatus('playing')
    setLetterStates({})
    setValidating(false)
  }

  // Reset when language changes
  useEffect(() => { newGame() }, [lang])

  const submitGuess = useCallback(async (word) => {
    if (validating) return
    setValidating(true)

    const validity = await isValidWord(word, lang)
    setValidating(false)

    if (validity === 'invalid') {
      showToast(t('wordleNotWord'))
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    if (validity === 'offline') {
      // Offline and word not in local list — warn but allow if it looks like a word
      showToast('⚠️ Hors ligne — mot non vérifié', 1500)
    }

    const result = evaluateGuess(word, target)
    const newGuess = { word, result }

    setGuesses(prev => {
      const newGuesses = [...prev, newGuess]

      // Update letter states
      setLetterStates(ls => {
        const next = { ...ls }
        const priority = { correct: 3, present: 2, absent: 1 }
        word.split('').forEach((ch, i) => {
          const state = result[i]
          if (!next[ch] || priority[state] > priority[next[ch]]) next[ch] = state
        })
        return next
      })

      if (result.every(r => r === 'correct')) {
        setStatus('won')
        showToast(`${t('wordleWin')} ${newGuesses.length}`, 3000)
      } else if (newGuesses.length >= MAX_GUESSES) {
        setStatus('lost')
        showToast(`${t('wordleLose')} ${target}`, 3500)
      }

      return newGuesses
    })
    setCurrent('')
  }, [validating, lang, target, t])

  const handleKey = useCallback((key) => {
    if (status !== 'playing' || validating) return

    if (key === 'BACKSPACE' || key === '⌫') {
      setCurrent(c => c.slice(0, -1))
      return
    }
    if (key === 'ENTER') {
      if (current.length < WORD_LENGTH) {
        showToast(t('wordleShort'))
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }
      submitGuess(current)
      return
    }

    if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
      setCurrent(c => c + key)
    }
  }, [status, validating, current, submitGuess, t])

  // Physical keyboard
  useEffect(() => {
    function onKey(e) {
      const k = e.key.toUpperCase()
      if (k === 'BACKSPACE') handleKey('BACKSPACE')
      else if (k === 'ENTER') handleKey('ENTER')
      else if (/^[A-Z]$/.test(k)) handleKey(k)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleKey])

  const kbRows = lang === 'fr' ? KEYBOARD_ROWS_FR : KEYBOARD_ROWS_EN

  return (
    <div className="game-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="game-header" style={{ maxWidth: 340 }}>
        <span className="game-title">{t('wordleTitle')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {loadingWords
            ? <span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>⏳ chargement…</span>
            : wordCount > 0
              ? <span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{wordCount.toLocaleString()} mots</span>
              : null
          }
          <button className="btn btn-ghost btn-sm" onClick={newGame}>{t('newGame')}</button>
        </div>
      </div>

      {/* Board */}
      <div className="wordle-board">
        {Array.from({ length: MAX_GUESSES }, (_, rowIdx) => {
          const guess = guesses[rowIdx]
          const isCurrent = rowIdx === guesses.length && status === 'playing'
          return (
            <div key={rowIdx} className="wordle-row">
              {Array.from({ length: WORD_LENGTH }, (_, colIdx) => {
                let letter = ''
                let state = 'empty'
                if (guess) {
                  letter = guess.word[colIdx]
                  state = guess.result[colIdx]
                } else if (isCurrent) {
                  letter = current[colIdx] || ''
                  state = letter ? 'filled' : 'empty'
                }
                return (
                  <div
                    key={colIdx}
                    className="wordle-tile"
                    data-state={state}
                    data-shake={isCurrent && shake ? 'true' : 'false'}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Keyboard */}
      <div className="wordle-keyboard">
        {kbRows.map((row, ri) => (
          <div key={ri} className="kb-row">
            {row.map(key => (
              <button
                key={key}
                className={`kb-key${key.length > 1 ? ' wide' : ''}`}
                data-state={letterStates[key] || 'none'}
                disabled={validating && key === 'ENTER'}
                onPointerDown={e => { e.preventDefault(); handleKey(key) }}
              >
                {key === 'ENTER' && validating ? '⏳' : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {status !== 'playing' && (
        <button className="btn" style={{ marginTop: 16 }} onClick={newGame}>
          <RotateCcw size={15} style={{ verticalAlign:'middle', marginRight:5 }} />{t('newGame')}
        </button>
      )}
    </div>
  )
}
