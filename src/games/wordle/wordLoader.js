/**
 * Fetches large word lists from public GitHub sources.
 * Results are cached in localStorage for 7 days so the app works offline.
 */

const SOURCES = {
  en: 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words',
  fr: 'https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/fr.txt',
}

const CACHE_KEY  = 'gamehub_wordlist_v1_'
const CACHE_TTL  = 7 * 24 * 60 * 60 * 1000 // 7 days

function parseWords(text) {
  return [...new Set(
    text
      .split('\n')
      .map(w => w.trim().toUpperCase())
      .filter(w => /^[A-Z]{5}$/.test(w))  // exactly 5 plain latin letters
  )]
}

/**
 * Returns a Promise<string[]> of 5-letter uppercase words for the given lang.
 * Falls back to null if network is unavailable.
 */
export async function fetchWordList(lang) {
  const key = CACHE_KEY + lang

  // --- Check cache ---
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const { words, ts } = JSON.parse(raw)
      if (Date.now() - ts < CACHE_TTL && Array.isArray(words) && words.length > 100) {
        return words
      }
    }
  } catch { /* corrupted cache — ignore */ }

  // --- Fetch from GitHub ---
  try {
    const res = await fetch(SOURCES[lang], { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const text = await res.text()
    const words = parseWords(text)
    if (words.length < 100) return null // something went wrong

    localStorage.setItem(key, JSON.stringify({ words, ts: Date.now() }))
    return words
  } catch {
    return null // offline or timed out
  }
}

/** Force-clear the cache (e.g. for debugging) */
export function clearWordCache() {
  localStorage.removeItem(CACHE_KEY + 'en')
  localStorage.removeItem(CACHE_KEY + 'fr')
}
