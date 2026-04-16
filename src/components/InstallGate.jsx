import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
}

function isStandalone() {
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
}

export default function InstallGate() {
  const [show, setShow] = useState(false)
  const [state, setState] = useState('idle') // 'ios' | 'android' | 'done'
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('install')) return

    // Already running as installed PWA → just go home
    if (isStandalone()) {
      navigate('/', { replace: true })
      return
    }

    setShow(true)

    if (window.__pwaPrompt) {
      setState('android')
      window.__pwaPrompt.prompt()
      window.__pwaPrompt.userChoice.then(() => {
        window.__pwaPrompt = null
        navigate('/', { replace: true })
      })
    } else if (isIOS()) {
      setState('ios')
    } else {
      // Desktop or unsupported browser → manual instructions
      setState('ios')
    }
  }, [])

  if (!show) return null

  const dismiss = () => navigate('/', { replace: true })

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={dismiss}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: '20px 20px 0 0',
          padding: '28px 24px 44px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {state === 'ios' && (
          <>
            <p style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 6 }}>
              📲 Ajouter à l'écran d'accueil
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: 16 }}>
              Add to Home Screen
            </p>
            <ol style={{ paddingLeft: 20, lineHeight: 2, fontSize: '0.95rem', color: 'var(--text)' }}>
              <li>Appuyez sur <strong>⬆ Partager</strong> (Safari)</li>
              <li>Tapez <strong>« Sur l'écran d'accueil »</strong></li>
              <li>Tapez <strong>« Ajouter »</strong> ✓</li>
            </ol>
            <button
              onClick={dismiss}
              style={{
                marginTop: 20, width: '100%', padding: '13px',
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 14, fontSize: '1rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              OK
            </button>
          </>
        )}
        {state === 'android' && (
          <p style={{ textAlign: 'center', padding: '16px 0', fontSize: '1rem' }}>
            ⏳ Fenêtre d'installation ouverte…
          </p>
        )}
        {state === 'idle' && (
          <>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>
              📱 Ouvre ce lien sur ton téléphone
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>
              Scanne le QR code avec un smartphone pour installer l'appli.
            </p>
            <button
              onClick={dismiss}
              style={{
                marginTop: 20, width: '100%', padding: '13px',
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 14, fontSize: '1rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              OK
            </button>
          </>
        )}
      </div>
    </div>
  )
}
