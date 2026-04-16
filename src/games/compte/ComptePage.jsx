import { useState, useEffect } from 'react'
import { useLang } from '../../contexts/LangContext'
import { RotateCcw, Undo2, Lightbulb, Target as TargetIcon } from 'lucide-react'

const SMALL_NUMS = [1,2,3,4,5,6,7,8,9,10]
const BIG_NUMS   = [25,50,75,100]
const OPS        = ['+','-','×','÷']
const TIMER_SEC  = 40

function generateNumbers(bigCount) {
  const bigs   = [...BIG_NUMS].sort(() => Math.random() - 0.5).slice(0, bigCount)
  const smalls = [...SMALL_NUMS, ...SMALL_NUMS].sort(() => Math.random() - 0.5).slice(0, 6 - bigCount)
  return [...bigs, ...smalls].sort((a, b) => b - a)
}

function generateTarget() {
  return Math.floor(Math.random() * 899) + 101
}

// Returns null for invalid; enforces Le Compte est Bon rules
function applyOp(a, op, b) {
  if (op === '+') return a + b
  if (op === '-') return a > b ? a - b : null       // must stay positive
  if (op === '×') return a > 1 && b > 1 ? a * b : null // no ×1
  if (op === '÷') return b > 1 && a % b === 0 ? a / b : null // exact only
  return null
}

// Recursive best-effort solver — returns { diff, steps[] }
function bestSolve(nums, target) {
  let best = { diff: Infinity, steps: null }
  const deadline = Date.now() + 200 // 200 ms max

  function dfs(available, steps) {
    if (Date.now() > deadline || best.diff === 0) return
    const curDiff = Math.min(...available.map(n => Math.abs(n - target)))
    if (curDiff < best.diff) best = { diff: curDiff, steps: [...steps] }
    if (available.length < 2) return

    for (let i = 0; i < available.length; i++) {
      for (let j = 0; j < available.length; j++) {
        if (i === j || Date.now() > deadline || best.diff === 0) continue
        const a = available[i], b = available[j]
        const rest = available.filter((_, k) => k !== i && k !== j)
        for (const op of OPS) {
          const res = applyOp(a, op, b)
          if (res !== null && res > 0) {
            dfs([res, ...rest], [...steps, `${a} ${op} ${b} = ${res}`])
          }
        }
      }
    }
  }

  dfs(nums, [])
  return best
}

export default function ComptePage() {
  const { t } = useLang()
  const [bigCount, setBigCount] = useState(1)
  const [numbers, setNumbers] = useState(() => generateNumbers(1))
  const [target, setTarget] = useState(generateTarget)
  const [steps, setSteps] = useState([])      // { expr: string, snapshot: {val,id}[] }
  const [available, setAvailable] = useState(null) // null = use original numbers
  const [firstSel, setFirstSel] = useState(null)
  const [opSel, setOpSel] = useState(null)
  const [status, setStatus] = useState('playing') // playing | won | timeout | stuck
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC)
  const [hint, setHint] = useState(null)
  const [errMsg, setErrMsg] = useState(null)

  const workingNums = available ?? numbers.map((v, i) => ({ val: v, id: i }))

  // Countdown timer
  useEffect(() => {
    if (status !== 'playing') return
    if (timeLeft <= 0) { setStatus('timeout'); return }
    const id = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, status])

  function newGame(bc = bigCount) {
    const n = generateNumbers(bc)
    setNumbers(n)
    setTarget(generateTarget())
    setAvailable(null)
    setSteps([])
    setFirstSel(null)
    setOpSel(null)
    setStatus('playing')
    setTimeLeft(TIMER_SEC)
    setHint(null)
    setErrMsg(null)
  }

  function showErr(msg) {
    setErrMsg(msg)
    setTimeout(() => setErrMsg(null), 1500)
  }

  function selectNumber(item) {
    if (status !== 'playing') return
    setHint(null)

    if (firstSel === null) {
      setFirstSel(item)
      return
    }
    // Tap same number → deselect
    if (firstSel.id === item.id) {
      setFirstSel(null)
      setOpSel(null)
      return
    }
    // No operator yet → switch first selection
    if (opSel === null) {
      setFirstSel(item)
      return
    }
    // Execute operation
    const result = applyOp(firstSel.val, opSel, item.val)
    if (result === null) {
      showErr(t('compteInvalid'))
      setFirstSel(null)
      setOpSel(null)
      return
    }

    const snapshot = [...workingNums]
    const newNums = workingNums
      .filter(n => n.id !== firstSel.id && n.id !== item.id)
      .concat({ val: result, id: Date.now() })

    setSteps(prev => [...prev, { expr: `${firstSel.val} ${opSel} ${item.val} = ${result}`, snapshot }])
    setAvailable(newNums)
    setFirstSel(null)
    setOpSel(null)

    if (result === target) setStatus('won')
    else if (newNums.length === 1) setStatus('stuck')
  }

  function selectOp(op) {
    if (!firstSel || status !== 'playing') return
    setOpSel(prev => prev === op ? null : op) // toggle
  }

  // Undo uses stored snapshots — no replay needed
  function undoStep() {
    if (steps.length === 0) return
    const lastStep = steps[steps.length - 1]
    setSteps(prev => prev.slice(0, -1))
    setAvailable(steps.length === 1 ? null : lastStep.snapshot)
    setFirstSel(null)
    setOpSel(null)
    setHint(null)
    if (status !== 'playing') {
      setStatus('playing')
      setTimeLeft(TIMER_SEC)
    }
  }

  function hardReset() {
    setAvailable(null)
    setSteps([])
    setFirstSel(null)
    setOpSel(null)
    setStatus('playing')
    setTimeLeft(TIMER_SEC)
    setHint(null)
    setErrMsg(null)
  }

  function getHint() {
    const result = bestSolve(workingNums.map(n => n.val), target)
    setHint(
      result.steps && result.steps.length > 0
        ? result.steps[0]
        : t('compteNoHint')
    )
  }

  const bestDiff = steps.length > 0
    ? Math.min(...workingNums.map(n => Math.abs(n.val - target)))
    : null

  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f97316' : 'var(--accent)'

  return (
    <div className="game-page">
      <div className="game-header" style={{ maxWidth: 480 }}>
        <span className="game-title">{t('compteTitle')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 900,
            fontSize: '1.15rem',
            color: timerColor,
            minWidth: 36,
            textAlign: 'right',
            transition: 'color 0.3s',
          }}>
            {timeLeft}s
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => newGame()}>
            <RotateCcw size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {t('newGame')}
          </button>
        </div>
      </div>

      <div className="compte-page">

        {/* Difficulty: number of big numbers */}
        <div className="compte-difficulty">
          <span className="compte-diff-label">{t('compteBig')}</span>
          {[0,1,2,3,4].map(n => (
            <button
              key={n}
              className={`btn btn-sm${bigCount === n ? '' : ' btn-ghost'}`}
              style={{ minWidth: 30, padding: '3px 8px' }}
              onClick={() => { setBigCount(n); newGame(n) }}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Target */}
        <div className="compte-target-label">{t('compteTarget')}</div>
        <div className="compte-target">{target}</div>

        {/* Available numbers */}
        <div className="compte-numbers">
          {workingNums.map(item => (
            <button
              key={item.id}
              className={`compte-num${firstSel?.id === item.id ? ' selected' : ''}`}
              onClick={() => selectNumber(item)}
            >
              {item.val}
            </button>
          ))}
        </div>

        {/* Operators */}
        <div className="compte-ops">
          {OPS.map(op => (
            <button
              key={op}
              className={`compte-op${opSel === op ? ' selected' : ''}`}
              onClick={() => selectOp(op)}
              disabled={!firstSel || status !== 'playing'}
            >
              {op}
            </button>
          ))}
        </div>

        {/* Expression / error display */}
        <div className="compte-expression">
          {errMsg ? (
            <span style={{ color: '#ef4444', fontWeight: 700 }}>{errMsg}</span>
          ) : firstSel ? (
            <>
              <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{firstSel.val}</span>
              {opSel
                ? <span style={{ margin: '0 6px', fontWeight: 800 }}>{opSel}</span>
                : <span style={{ color: 'var(--text2)', fontSize: '0.82rem', marginLeft: 8 }}>{t('comptePickOp')}</span>
              }
            </>
          ) : (
            <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{t('comptePickNum')}</span>
          )}
        </div>

        {/* Hint box */}
        {hint && (
          <div className="compte-hint">
            <Lightbulb size={15} style={{ flexShrink: 0 }} />
            <span>{hint}</span>
          </div>
        )}

        {/* Steps history */}
        {steps.length > 0 && (
          <div className="compte-steps">
            {steps.map((s, i) => {
              const res = Number(s.expr.split(' = ')[1])
              return (
                <div key={i} className="compte-step">
                  <span>{s.expr}</span>
                  {res === target && <TargetIcon size={14} style={{ color: 'var(--correct)', flexShrink: 0 }} />}
                </div>
              )
            })}
          </div>
        )}

        {/* Status messages */}
        {status === 'won' && (
          <div className="compte-result-display win">
            <TargetIcon size={18} style={{ marginRight: 6, flexShrink: 0 }} />
            {t('compteWin')}
          </div>
        )}
        {(status === 'timeout' || status === 'stuck') && (
          <div className="compte-result-display close">
            {status === 'timeout' ? t('compteTimeUp') : t('compteStuck')}
            {bestDiff != null && bestDiff > 0 && ` — ${t('compteClose')} ±${bestDiff}`}
          </div>
        )}
        {status === 'playing' && bestDiff !== null && bestDiff > 0 && (
          <div className="compte-result-display close">
            {t('compteClose')} ±{bestDiff}
          </div>
        )}

        {/* Action buttons */}
        <div className="compte-actions">
          <button className="btn btn-ghost btn-sm" onClick={hardReset}>
            <RotateCcw size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {t('compteClear')}
          </button>
          {steps.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={undoStep}>
              <Undo2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {t('compteUndo')}
            </button>
          )}
          {status === 'playing' && (
            <button className="btn btn-ghost btn-sm" onClick={getHint}>
              <Lightbulb size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {t('compteHint')}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
