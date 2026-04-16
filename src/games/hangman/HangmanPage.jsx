import { useState, useEffect, useCallback } from 'react'
import { useLang } from '../../contexts/LangContext'
import { Trophy, Skull, RotateCcw, Lightbulb, Loader } from 'lucide-react'

// ── Local fallback word lists ──────────────────────────────────────────────
const FALLBACK_EN = [
  'APPLE','BRAVE','CLOUD','DREAM','FLAME','GRACE','HEART','KNIFE','LEMON','MAGIC',
  'NIGHT','OCEAN','PIANO','QUEEN','RIVER','STONE','TIGER','VIVID','WITCH','YACHT',
  'BEACH','CANDY','DANCE','EAGLE','FANCY','GIANT','HONEY','JOKER','KARMA','MAPLE',
  'NOBLE','ORBIT','PIZZA','ROBIN','SOLAR','TOTAL','VENOM','WATER','ZESTY','BRAVO',
  'CASTLE','DRIVER','FLOWER','GARDEN','HUNTER','ISLAND','JUNGLE','KNIGHT','LADDER',
  'MIRROR','NEEDLE','ORANGE','PENCIL','RABBIT','SILVER','TEMPLE','WINTER','YELLOW',
  'BRIDGE','BUTTER','CANDLE','COFFEE','CORNER','COTTON','COUPLE','DANGER','DESERT',
  'DETAIL','DINNER','DOUBLE','DRAGON','FABRIC','FINGER','FOREST','FROZEN','GENTLE',
  'GRAVEL','GUITAR','HARBOR','HELMET','HIDDEN','HOLLOW','INSECT','INVITE','JIGSAW',
  'KERNEL','KITTEN','LANTERN','LIQUID','LIZARD','MARBLE','MATRIX','MEMBER','MENTOR',
  'MIDWAY','MONKEY','MORTAL','MOTHER','MUSCLE','MUTUAL','MYSTIC','NAPKIN','NICKEL',
  'NORMAL','NOTICE','OYSTER','PARROT','PATROL','PEBBLE','PLANET','PLASTIC','POCKET',
  'PORTAL','POSTER','PURPLE','PUZZLE','RAFTER','RANDOM','RANGER','RASCAL','RIBBON',
  'RIDDLE','ROCKET','RUBBER','RUNNER','SADDLE','SALMON','SAVAGE','SECTOR','SENDER',
  'SENSOR','SHADOW','SHIELD','SIGNAL','SILENT','SIMPLE','SKETCH','SLEEVE','SMOOTH',
  'SOCKET','SPIRIT','SPLASH','SPRING','STABLE','STICKY','STOLEN','STREAM','STRIPE',
  'STRONG','STUPID','SUBTLE','SWITCH','SYMBOL','SYNTAX','SYSTEM','TARGET','TENDER',
  'THREAD','THROWN','TICKET','TIMBER','TINSEL','TISSUE','TOGGLE','TONGUE','TOSSED',
  'TOUCHY','TROPHY','TUNNEL','TURBAN','TURNIP','TURTLE','TWITCH','TYPHON','UNLOCK',
]

// French words 5–8 letters, accent-stripped, strictly A–Z
const FALLBACK_FR_5 = [
  'AVION','BALLE','CARTE','DANSE','FLEUR','HERBE','IMAGE','LIVRE','MONDE','OCEAN',
  'PLAGE','REVES','TABLE','VILLE','ARBRE','BLANC','CRABE','DOIGT','FORET','GORGE',
  'HIBOU','LAPIN','ROUGE','SUCRE','TRAIN','NUAGE','PLUIE','TIGRE','CHIEN','BOEUF',
  'POULE','CANIF','VERRE','FROID','CHAUD','ECOLE','MAGIE','SOLEIL','NEIGE','ETOILE',
  'BRAVE','CALME','CHAMP','CHOSE','CORPS','COURT','CRANE','CROIX','CRUEL','DEBUT',
  'DENSE','DESIR','DETTE','DROIT','DUVET','EPAIS','FABLE','FAUVE','FEMME','FETES',
  'FLUTE','FOYER','FRANC','GANTS','GARDE','GENIE','GLACE','GLOBE','GOLFE','GRACE',
  'GRAIN','GRAND','GRAVE','GRIEF','GUIDE','HEROS','HIVER','HONTE','HOTEL','IDEES',
  'JARDIN','JEUNE','JOUER','JOUES','LARME','LECON','LIGNE','LILAS','LISTE','LITRE',
  'LONGS','LOURD','LOUVE','LUEUR','LUNDI','LUSTRE','LUXES','LYRES','MAFIA','MAINS',
]
const FALLBACK_FR_6 = [
  'JARDIN','SOLEIL','CHEMIN','CERVEAU','COMBAT','COMPTE','DESERT','DRAGON','ENFANT',
  'ENTIER','ENIGME','ENTREE','ESPOIR','ETABLE','ETOFFE','EXTASE','FAIBLE','FALAISE',
  'FAMILLE','FARCES','FAUCON','FIERTE','FIGURE','FILTRE','FLECHE','FLOTTE','FLUIDE',
  'FOUDRE','FOURMI','FRAISE','FROMAGE','FUMIER','GATEAU','GIRAFE','GLOIRE','GOUTTE',
  'GRIFFE','GUEULE','GUERRE','HAMEAU','HUMEUR','LUMIERE','MAISON','MARCHE','MIROIR',
  'MISERE','NATURE','NUANCE','NUMERO','OISEAU','ORANGE','PAROLE','PELAGE','PIERRE',
  'PLANTE','POISON','POLICE','POULET','PRAIRIE','PRISON','PROJET','PROPOS','PROPRE',
  'REFUGE','REMEDE','RENARD','REQUIN','RESEAU','RETOUR','RIVAGE','SAISON','SAUMON',
  'SAVANT','SECRET','SILLON','SIMPLE','SOCIAL','SOIREE','TALENT','TEMPLE','TERTRE',
  'TOMATE','TOUCHE','TOUPIE','TORTUE','TRESOR','TRIBU','TRISTE','VALEUR','VIOLET',
]
const FALLBACK_FR_7 = [
  'CERVEAU','CHALEUR','CHATEAU','CHEMISE','CHEVEUX','COLLINE','COURAGE','CRISTAL',
  'DOULEUR','ECHARPE','ECRITURE','EMOTION','EQUIPE','ESSENCE','ETOILES','EXEMPLE',
  'FEUILLE','FENETRE','FIEVRE','FONTAINE','FORREST','FOURNEE','FRAGILE','FROMAGE',
  'GARCONS','GLISSADE','GRENOUIL','HISTOIRE','HORIZON','HUMAINE','IDENTITE','INCONNU',
  'INSECTE','JARDINIER','JEUNESSE','JONGLEUR','LANTERNE','LAVANDE','LEGENDE','LIBERTE',
  'MACHINE','MAGASIN','MAGNOLIA','MAILLOT','MANTEAU','MARTEAU','MATIERE','MEDECIN',
  'MEMOIRE','MERVEILLE','MESSAGE','MEUBLE','MIRACLE','MONTAGNE','MOUETTE','MYSTERE',
  'NAVIRE','NOBLESSE','NUANCES','OMBRAGE','PATIENCE','PAUVRETE','PAYSAGE','PECHEUR',
  'PELICAN','PENSEES','PISCINE','PLATEAU','PLONGEE','POISSON','PORTAIL','POUSSIERE',
  'PRAIRIE','PRESENT','PRINTEMPS','PROMESSE','PROUESSE','PUPITRE','RICHESSE','RIVIERE',
]
const FALLBACK_FR_8 = [
  'AVENTURE','ANCIENNE','BARRIERE','BEAUTE','BONHEUR','BOUTIQUE','BROUETTE','BRUYANTE',
  'CAISSIER','CALVAIRE','CARAVANE','CHANSON','CHARISME','CHASSEUR','CHATIMENT','CHIMIQUE',
  'CHOCOLAT','CHOISIR','CITOYEN','CLOTURE','COIFFURE','COMMERCE','COMMANDE','CONSIGNE',
  'COSTUMES','CREATEUR','CRITIQUE','CROYANCE','CYCLISTE','DANSEUSE','DECISION','DEVOTION',
  'DIALOGUE','DICTAIRE','DIRECTEUR','DISTANCE','DOCUMENT','DOUCEUR','ECONOMIC','ECRITURE',
  'ELEGANCE','EMOTIONS','ENSEMBLE','ESCALIER','ESPERANCE','ETUDIANT','EVIDENCE','EXERCICE',
  'FANTASME','FAROUCHE','FAUTEUIL','FEMININE','FESTIVAL','FIDELITE','FINANCER','FLAMBEAUX',
  'FLAMBEAU','FONDERIE','FONTAINE','FORTERESSE','FRACTURE','FRAGMENT','FRATERNEL','FURTIF',
  'GALAXIES','GALERIES','GARANTIE','GARDERIE','GASOLIINE','GRAVURES','GROSSESSE','GUIDANCE',
  'HARMONIE','HERITAGE','HISTOIRE','HONNEUR','HOPITAUX','HUMANITE','IDENTITE','IMAGINER',
]

const FR_BY_LEN = [FALLBACK_FR_5, FALLBACK_FR_6, FALLBACK_FR_7, FALLBACK_FR_8]

function localWord(lang) {
  if (lang === 'fr') {
    // Pick a random length bucket, then a random word from it
    const bucket = FR_BY_LEN[Math.floor(Math.random() * FR_BY_LEN.length)]
    return bucket[Math.floor(Math.random() * bucket.length)]
  }
  return FALLBACK_EN[Math.floor(Math.random() * FALLBACK_EN.length)]
}

// ── API helpers ────────────────────────────────────────────────────────────

// AbortSignal.timeout() isn't universally supported — use AbortController
function timeoutSignal(ms) {
  const ctrl = new AbortController()
  setTimeout(() => ctrl.abort(), ms)
  return ctrl.signal
}

// Fetches a random English word of 5–8 letters via Datamuse API (no key, CORS OK)
async function fetchRandomWordEN() {
  const lengths = [5, 6, 7, 8]
  const len = lengths[Math.floor(Math.random() * lengths.length)]
  // '?' is the Datamuse single-char wildcard — must be percent-encoded in query values
  const pattern = '%3F'.repeat(len)
  const res = await fetch(
    `https://api.datamuse.com/words?sp=${pattern}&max=500`,
    { signal: timeoutSignal(5000) }
  )
  if (!res.ok) throw new Error('API error')
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) throw new Error('No results')
  // Filter to strictly alphabetic words of the target length
  const valid = data
    .map(d => d.word.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z]/g, ''))
    .filter(w => w.length === len)
  if (valid.length === 0) throw new Error('No valid words')
  return valid[Math.floor(Math.random() * valid.length)]
}

// Fetches English definition from Free Dictionary API
async function fetchDefinition(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`,
      { signal: timeoutSignal(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition ?? null
  } catch {
    return null
  }
}

// ── Gallows SVG ────────────────────────────────────────────────────────────
function Gallows({ wrong }) {
  return (
    <svg className="hangman-svg" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="20" y1="210" x2="180" y2="210" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <line x1="60" y1="210" x2="60" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <line x1="60" y1="20" x2="140" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <line x1="140" y1="20" x2="140" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      {wrong >= 1 && <circle cx="140" cy="68" r="18" stroke="currentColor" strokeWidth="3" fill="none"/>}
      {wrong >= 2 && <line x1="140" y1="86" x2="140" y2="140" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>}
      {wrong >= 3 && <line x1="140" y1="100" x2="110" y2="125" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>}
      {wrong >= 4 && <line x1="140" y1="100" x2="170" y2="125" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>}
      {wrong >= 5 && <line x1="140" y1="140" x2="110" y2="170" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>}
      {wrong >= 6 && <line x1="140" y1="140" x2="170" y2="170" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>}
    </svg>
  )
}

const MAX_WRONG = 6

const KEYBOARD_FR = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN']
const KEYBOARD_EN = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

export default function HangmanPage() {
  const { t, lang } = useLang()

  const [word, setWord] = useState('')
  const [guessed, setGuessed] = useState(new Set())
  const [status, setStatus] = useState('playing') // playing | won | lost
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [hint, setHint] = useState(null)       // definition string
  const [hintLoading, setHintLoading] = useState(false)
  const [hintShown, setHintShown] = useState(false)

  const wrong = [...guessed].filter(l => !word.includes(l)).length
  const won = word.length > 0 && word.split('').every(l => guessed.has(l))
  const lost = wrong >= MAX_WRONG

  useEffect(() => {
    if (won) setStatus('won')
    else if (lost) setStatus('lost')
  }, [won, lost])

  // ── Load a word ──────────────────────────────────────────────────────────
  const loadWord = useCallback(async (currentLang) => {
    setLoading(true)
    setFetchError(false)
    setGuessed(new Set())
    setStatus('playing')
    setHint(null)
    setHintShown(false)
    setWord('')

    try {
      let w = ''
      if (currentLang === 'en') {
        try {
          w = await fetchRandomWordEN()
          if (w.length < 4) w = localWord(currentLang)
        } catch {
          w = localWord(currentLang)
          setFetchError(true)
        }
      } else {
        w = localWord(currentLang)
      }
      setWord(w)
    } finally {
      // Always unblock the button and hide spinner, even if something throws
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadWord(lang) }, [lang, loadWord])

  // Keyboard handler
  useEffect(() => {
    const onKey = (e) => {
      const l = e.key.toUpperCase()
      if (/^[A-Z]$/.test(l) && status === 'playing' && !loading) guess(l)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, word, loading])

  function guess(letter) {
    if (guessed.has(letter) || status !== 'playing' || loading) return
    setGuessed(prev => new Set([...prev, letter]))
  }

  async function showHint() {
    if (hintShown || lang !== 'en') return
    setHintShown(true)
    setHintLoading(true)
    const def = await fetchDefinition(word)
    setHint(def)
    setHintLoading(false)
  }

  const rows = lang === 'fr' ? KEYBOARD_FR : KEYBOARD_EN

  return (
    <div className="game-page">
      <div className="game-header">
        <span className="game-title">{t('hangmanTitle')}</span>
        <button className="btn btn-sm" onClick={() => loadWord(lang)} disabled={loading}>
          <RotateCcw size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {t('newGame')}
        </button>
      </div>

      <div className="hangman-container">
        <Gallows wrong={wrong} />

        <div className="hangman-wrong-count">{wrong} / {MAX_WRONG}</div>

        {/* Word display */}
        {loading ? (
          <div className="hangman-loading">
            <Loader size={18} className="hangman-spinner" />
            <span>{t('hangmanLoading')}</span>
          </div>
        ) : (
          <div className="hangman-word">
            {word.split('').map((l, i) => (
              <div key={i} className="hangman-letter">
                <span className="hangman-letter-char">{guessed.has(l) ? l : ''}</span>
                <div className="hangman-letter-line" />
              </div>
            ))}
          </div>
        )}

        {/* Network error badge */}
        {fetchError && (
          <div className="hangman-api-note">{t('hangmanError')}</div>
        )}

        {/* Hint (EN only) */}
        {!loading && lang === 'en' && status === 'playing' && !hintShown && (
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={showHint}>
            <Lightbulb size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {t('hangmanHint')}
          </button>
        )}
        {hintLoading && (
          <div className="hangman-hint-box">
            <Loader size={14} className="hangman-spinner" style={{ marginRight: 6 }} />
            …
          </div>
        )}
        {hintShown && !hintLoading && (
          <div className="hangman-hint-box">
            <Lightbulb size={14} style={{ flexShrink: 0 }} />
            <span>{hint ?? t('hangmanNoHint')}</span>
          </div>
        )}

        {/* Result */}
        {status !== 'playing' && !loading && (
          <div className={`hangman-result ${status}`}>
            {status === 'won'
              ? <><Trophy size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />{t('win')}</>
              : <><Skull size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />{t('lose')} — {word}</>
            }
          </div>
        )}

        {/* Keyboard */}
        {!loading && (
          <div className="hangman-keyboard">
            {rows.map((row, ri) => (
              <div key={ri} className="hangman-kb-row">
                {row.split('').map(l => (
                  <button
                    key={l}
                    className={`hangman-key ${guessed.has(l) ? (word.includes(l) ? 'correct' : 'wrong') : ''}`}
                    onClick={() => guess(l)}
                    disabled={guessed.has(l) || status !== 'playing'}
                  >
                    {l}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

