import { QRCodeSVG } from 'qrcode.react'
import { Moon, Sun, Clock } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useLang } from '../contexts/LangContext'

const APP_URL = 'https://wordle-self-sigma.vercel.app'

const SWATCHES = {
  default: 'linear-gradient(135deg,#6366f1,#818cf8)',
  ocean:   'linear-gradient(135deg,#0ea5e9,#38bdf8)',
  forest:  'linear-gradient(135deg,#16a34a,#4ade80)',
  sunset:  'linear-gradient(135deg,#f97316,#fbbf24)',
  candy:   'linear-gradient(135deg,#ec4899,#f472b6)',
}

export default function Settings() {
  const { theme, setTheme, dark, darkMode, setDarkMode, THEMES } = useTheme()
  const { lang, setLang, t } = useLang()

  return (
    <div className="settings-page">
      <div className="settings-section">
        <div className="settings-label">{t('theme')}</div>
        <div className="theme-grid">
          {THEMES.map(th => (
            <button
              key={th}
              className={`theme-swatch${theme === th ? ' active' : ''}`}
              style={{ background: SWATCHES[th] }}
              aria-label={t('themes')?.[th] ?? th}
              onClick={() => setTheme(th)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {THEMES.map(th => (
            <span
              key={th}
              style={{ fontSize: '0.72rem', color: 'var(--text2)', width: 44, textAlign: 'center' }}
            >
              {t('themes')?.[th]}
            </span>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-label">{t('darkMode')}</div>
        <div className="dark-mode-trio">
          <button
            className={`dark-trio-btn${darkMode === 'light' ? ' active' : ''}`}
            onClick={() => setDarkMode('light')}
            title="Light"
          >
            <Sun size={16} />
            <span>Light</span>
          </button>
          <button
            className={`dark-trio-btn${darkMode === 'auto' ? ' active' : ''}`}
            onClick={() => setDarkMode('auto')}
            title="Auto (20h–7h)"
          >
            <Clock size={16} />
            <span>Auto</span>
          </button>
          <button
            className={`dark-trio-btn${darkMode === 'dark' ? ' active' : ''}`}
            onClick={() => setDarkMode('dark')}
            title="Dark"
          >
            <Moon size={16} />
            <span>Dark</span>
          </button>
        </div>
        {darkMode === 'auto' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 6 }}>
            {dark ? '🌙 Night mode active (20h–7h)' : '☀️ Day mode active (7h–20h)'}
          </p>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-label">{t('installTitle')}</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text2)', margin: '0 0 12px' }}>{t('installDesc')}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 12 }}>
            <QRCodeSVG value={APP_URL + '?install=1'} size={160} />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text2)', textAlign: 'center', marginTop: 8, wordBreak: 'break-all' }}>{APP_URL}</p>
      </div>

      <div className="settings-section">
        <div className="settings-label">{t('language')}</div>
        <div className="lang-toggle">
          <button className={`lang-btn${lang === 'fr' ? ' active' : ''}`} onClick={() => { setLang('fr'); localStorage.setItem('lang','fr') }}>
            🇫🇷 Français
          </button>
          <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => { setLang('en'); localStorage.setItem('lang','en') }}>
            🇬🇧 English
          </button>
        </div>
      </div>
    </div>
  )
}
