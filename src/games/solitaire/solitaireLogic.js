// Klondike Solitaire game logic

export const SUITS = ['♠','♥','♦','♣']
export const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

export function makeCard(suit, rank) {
  const color = suit === '♥' || suit === '♦' ? 'red' : 'black'
  const rankIdx = RANKS.indexOf(rank)
  return { suit, rank, color, rankIdx, faceUp: false, id: `${rank}${suit}` }
}

export function createDeck() {
  const deck = []
  for (const suit of SUITS)
    for (const rank of RANKS)
      deck.push(makeCard(suit, rank))
  return deck
}

export function shuffleDeck(deck) {
  const d = [...deck]
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

export function dealGame() {
  const deck = shuffleDeck(createDeck())
  const tableau = Array.from({ length: 7 }, () => [])
  let idx = 0
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[idx++], faceUp: row === col }
      tableau[col].push(card)
    }
  }
  const stock = deck.slice(idx).map(c => ({ ...c, faceUp: false }))
  return {
    tableau,
    stock,
    waste: [],
    foundations: [[], [], [], []], // ♠ ♥ ♦ ♣
    score: 0,
  }
}

export function canPlaceOnFoundation(card, foundation) {
  if (foundation.length === 0) return card.rank === 'A'
  const top = foundation[foundation.length - 1]
  return top.suit === card.suit && card.rankIdx === top.rankIdx + 1
}

export function canPlaceOnTableau(card, targetCol) {
  if (targetCol.length === 0) return card.rank === 'K'
  const top = targetCol[targetCol.length - 1]
  return top.faceUp && top.color !== card.color && card.rankIdx === top.rankIdx - 1
}

export function foundationSuitIdx(suit) {
  return SUITS.indexOf(suit)
}
