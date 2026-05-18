import { useState, useEffect } from 'react'
import { useLang } from '../../contexts/LangContext'
import { RotateCcw, Spade } from 'lucide-react'
import {
  dealGame, canPlaceOnFoundation, canPlaceOnTableau,
  foundationSuitIdx, SUITS
} from './solitaireLogic'

export default function SolitairePage() {
  const { t } = useLang()
  const [state, setState] = useState(dealGame)
  const [selected, setSelected] = useState(null) // { from: 'tableau'|'waste', col?, cardIdx?, cards }
  const [history, setHistory] = useState([])
  const [won, setWon] = useState(false)
  const [showAutoModal, setShowAutoModal] = useState(false)

  function saveHistory(s) {
    setHistory(prev => [...prev.slice(-30), structuredClone(s)])
  }

  function newGame() {
    setState(dealGame())
    setSelected(null)
    setHistory([])
    setWon(false)
  }

  function undo() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setState(prev)
    setSelected(null)
  }

  // Draw from stock
  function drawStock() {
    if (selected) { setSelected(null); return }
    setState(prev => {
      saveHistory(prev)
      const s = deepCopy(prev)
      if (s.stock.length === 0) {
        // Reset: put waste back into stock face down
        s.stock = s.waste.reverse().map(c => ({ ...c, faceUp: false }))
        s.waste = []
      } else {
        const card = { ...s.stock.pop(), faceUp: true }
        s.waste.push(card)
      }
      return s
    })
  }

  // Select waste top card
  function selectWaste() {
    const s = state
    if (s.waste.length === 0) return
    const card = s.waste[s.waste.length - 1]
    if (selected?.from === 'waste') { setSelected(null); return }
    setSelected({ from: 'waste', cards: [card] })
  }

  // Click on tableau card
  function clickTableau(colIdx, cardIdx) {
    const col = state.tableau[colIdx]
    const card = col[cardIdx]

    if (!card.faceUp) {
      // Flip if it's the top card
      if (cardIdx === col.length - 1) {
        setState(prev => {
          saveHistory(prev)
          const s = deepCopy(prev)
          s.tableau[colIdx][cardIdx].faceUp = true
          return s
        })
      }
      return
    }

    const cards = col.slice(cardIdx)

    if (selected) {
      // Try to place selected cards here
      if (canPlaceOnTableau(selected.cards[0], col)) {
        placeOnTableau(colIdx)
      } else {
        // Change selection
        setSelected({ from: 'tableau', col: colIdx, cardIdx, cards })
      }
    } else {
      setSelected({ from: 'tableau', col: colIdx, cardIdx, cards })
    }
  }

  // Click on empty tableau column
  function clickEmptyTableau(colIdx) {
    if (!selected) return
    if (selected.cards[0].rank === 'K') {
      placeOnTableau(colIdx)
    }
  }

  function placeOnTableau(colIdx) {
    if (!selected) return
    setState(prev => {
      saveHistory(prev)
      const s = deepCopy(prev)
      if (selected.from === 'waste') {
        s.waste.pop()
      } else {
        s.tableau[selected.col].splice(selected.cardIdx)
        // Flip new top if face down
        const tc = s.tableau[selected.col]
        if (tc.length > 0 && !tc[tc.length - 1].faceUp) {
          tc[tc.length - 1].faceUp = true
          s.score += 5
        }
      }
      s.tableau[colIdx].push(...selected.cards)
      return s
    })
    setSelected(null)
  }

  // Click on foundation
  function clickFoundation(foundIdx) {
    if (selected?.cards?.length !== 1) return
    const card = selected.cards[0]
    const foundation = state.foundations[foundIdx]
    const expectedSuit = SUITS[foundIdx]

    if (card.suit === expectedSuit && canPlaceOnFoundation(card, foundation)) {
      setState(prev => {
        saveHistory(prev)
        const s = deepCopy(prev)
        s.foundations[foundIdx].push(card)
        s.score += 10
        if (selected.from === 'waste') {
          s.waste.pop()
        } else {
          s.tableau[selected.col].splice(selected.cardIdx)
          const tc = s.tableau[selected.col]
          if (tc.length > 0 && !tc[tc.length - 1].faceUp) {
            tc[tc.length - 1].faceUp = true
            s.score += 5
          }
        }
        return s
      })
      setSelected(null)

      // Check win after state update
      setTimeout(() => {
        setState(s => {
          if (checkWonState(s)) setWon(true)
          return s
        })
      }, 100)
    } else {
      setSelected(null)
    }
  }

  // Auto-move top card to foundation
  function autoMove(colIdx) {
    const col = state.tableau[colIdx]
    if (col.length === 0) return
    const card = col[col.length - 1]
    if (!card.faceUp) return
    const fi = foundationSuitIdx(card.suit)
    if (canPlaceOnFoundation(card, state.foundations[fi])) {
      setState(prev => {
        saveHistory(prev)
        const s = deepCopy(prev)
        moveTableauTopToFoundationState(s, colIdx)
        return s
      })
      setSelected(null)
      setTimeout(() => {
        setState(s => {
          if (checkWon(s)) setWon(true)
          return s
        })
      }, 100)
    }
  }

  function autoComplete() {
    setSelected(null)

    const hasAvailableMove = hasAutoCompleteMove(state)
    if (!hasAvailableMove) return

    saveHistory(state)
    
    // Get animation steps
    const steps = getAutoCompleteSteps(state)
    
    // Apply each step with 200ms delay
    steps.forEach((stepState, index) => {
      setTimeout(() => {
        setState(stepState)
        
        // Check win after last step
        if (index === steps.length - 1) {
          setTimeout(() => {
            setState(s => {
              if (checkWonState(s)) setWon(true)
              return s
            })
          }, 100)
        }
      }, index * 200)
    })
  }

  function allCardsRevealed(s) {
    return s.tableau.every(col => col.every(card => card.faceUp))
  }

  useEffect(() => {
    if (won) return
    if (allCardsRevealed(state) && hasAutoCompleteMove(state)) {
      setShowAutoModal(true)
    }
  }, [state, won])

  const { tableau, stock, waste, foundations, score } = state

  return (
    <div className="game-page" style={{ padding: '8px 6px 32px' }}>
      {won && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-emoji"><Spade size={48} /></div>
            <div className="win-title">{t('solitaireWin')}</div>
            <div className="win-sub">{t('score')}: {score}</div>
            <button className="btn" onClick={newGame}><RotateCcw size={15} style={{ verticalAlign:'middle', marginRight:5 }} />{t('solitaireNewGame')}</button>
          </div>
        </div>
      )}

      {showAutoModal && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-title">{t('solitaireAutoComplete')}</div>
            <div className="win-sub" style={{ marginBottom: 20 }}>{t('solitaireAutoCompleteDesc')}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn" onClick={() => { setShowAutoModal(false); autoComplete() }}>
                {t('solitaireYes')}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowAutoModal(false)}>
                {t('solitaireNo')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="game-header" style={{ maxWidth: 420 }}>
        <span className="game-title">{t('solitaireTitle')}</span>
        <span className="solitaire-score">{t('score')}: {score}</span>
      </div>

      <div className="solitaire-page">
        {/* Top row: stock/waste + foundations */}
        <div className="solitaire-top">
          <div className="solitaire-stock-waste">
            {/* Stock */}
            <div className="card-slot" onClick={drawStock} style={{ cursor: 'pointer' }}>
              {stock.length > 0
                ? <div className="playing-card face-down" />
                : <span style={{ fontSize: '1.2rem' }}><RotateCcw size={18} /></span>
              }
            </div>
            {/* Waste */}
            <div className="card-slot" onClick={selectWaste}>
              {waste.length > 0
                ? <PlayingCard
                    card={waste[waste.length - 1]}
                    isSelected={selected?.from === 'waste'}
                  />
                : null
              }
            </div>
          </div>

          {/* Foundations */}
          <div className="solitaire-foundations">
            {SUITS.map((suit, i) => {
              const top = foundations[i][foundations[i].length - 1]
              return (
                <div key={suit} className="card-slot" onClick={() => clickFoundation(i)}
                  style={{ borderColor: selected ? 'var(--accent)' : undefined }}>
                  {top
                    ? <PlayingCard card={top} isSelected={false} />
                    : <span style={{ opacity: 0.4 }}>{suit}</span>
                  }
                </div>
              )
            })}
          </div>
        </div>

        {/* Tableau */}
        <div className="solitaire-tableau">
          {tableau.map((col, colIdx) => (
            <div
              key={colIdx}
              className="tableau-col"
              onClick={() => col.length === 0 && clickEmptyTableau(colIdx)}
              style={{ minHeight: 70 }}
            >
              {col.length === 0 && (
                <div className="card-slot" style={{ position: 'relative', zIndex: 0 }} />
              )}
              {col.map((card, cardIdx) => (
                <div
                  key={card.id}
                  style={{ position: 'relative', zIndex: cardIdx, marginTop: cardIdx === 0 ? 0 : -38 }}
                  onClick={e => { e.stopPropagation(); clickTableau(colIdx, cardIdx) }}
                  onDoubleClick={e => { e.stopPropagation(); autoMove(colIdx) }}
                >
                  {card.faceUp
                    ? <PlayingCard
                        card={card}
                        isSelected={
                          selected?.from === 'tableau' &&
                          selected?.col === colIdx &&
                          cardIdx >= selected?.cardIdx
                        }
                      />
                    : <div className="playing-card face-down" />
                  }
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={undo} disabled={history.length === 0}>
            ↩ {t('solitaireUndo')}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={newGame}>
            <RotateCcw size={15} style={{ verticalAlign:'middle', marginRight:5 }} />{t('solitaireNewGame')}
          </button>
        </div>
      </div>
    </div>
  )
}

function PlayingCard({ card, isSelected }) {
  const suitSymbol = { '♠': '♠', '♥': '♥', '♦': '♦', '♣': '♣' }[card.suit] ?? card.suit
  return (
    <div className={`playing-card ${card.color}${isSelected ? ' selected' : ''}`}>
      <div className="card-corner-top">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit-sm">{suitSymbol}</span>
      </div>
      <div className="card-center-suit">{suitSymbol}</div>
      <div className="card-corner-bot">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit-sm">{suitSymbol}</span>
      </div>
    </div>
  )
}

function deepCopy(obj) {
  return structuredClone(obj)
}

function checkWonState(s) {
  return s.foundations.every(f => f.length === 13)
}

function checkWon(s) {
  return checkWonState(s)
}

function moveWasteTopToFoundationState(s) {
  if (s.waste.length === 0) return false
  const card = s.waste[s.waste.length - 1]
  const fi = foundationSuitIdx(card.suit)
  if (!canPlaceOnFoundation(card, s.foundations[fi])) return false

  s.waste.pop()
  s.foundations[fi].push(card)
  s.score += 10
  return true
}

function moveTableauTopToFoundationState(s, colIdx) {
  const col = s.tableau[colIdx]
  if (col.length === 0) return false

  const card = col[col.length - 1]
  if (!card?.faceUp) return false

  const fi = foundationSuitIdx(card.suit)
  if (!canPlaceOnFoundation(card, s.foundations[fi])) return false

  col.pop()
  s.foundations[fi].push(card)
  s.score += 10

  if (col.length > 0 && !col[col.length - 1].faceUp) {
    col[col.length - 1].faceUp = true
    s.score += 5
  }

  return true
}

function autoCompleteState(s) {
  while (true) {
    if (moveWasteTopToFoundationState(s)) continue

    let moved = false
    for (let colIdx = 0; colIdx < s.tableau.length; colIdx++) {
      if (moveTableauTopToFoundationState(s, colIdx)) {
        moved = true
        break
      }
    }

    if (!moved) break
  }

  return s
}

function getAutoCompleteSteps(initialState) {
  const steps = [deepCopy(initialState)]
  const s = deepCopy(initialState)

  while (true) {
    if (moveWasteTopToFoundationState(s)) {
      steps.push(deepCopy(s))
      continue
    }

    let moved = false
    for (let colIdx = 0; colIdx < s.tableau.length; colIdx++) {
      if (moveTableauTopToFoundationState(s, colIdx)) {
        steps.push(deepCopy(s))
        moved = true
        break
      }
    }

    if (!moved) break
  }

  return steps
}

function hasAutoCompleteMove(s) {
  if (s.waste.length > 0) {
    const card = s.waste[s.waste.length - 1]
    const fi = foundationSuitIdx(card.suit)
    if (canPlaceOnFoundation(card, s.foundations[fi])) return true
  }

  return s.tableau.some(col => {
    const card = col[col.length - 1]
    if (!card?.faceUp) return false
    return canPlaceOnFoundation(card, s.foundations[foundationSuitIdx(card.suit)])
  })
}
