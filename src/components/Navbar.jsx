import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react'

export default function Navbar() {
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {!isHome && (
          <button className="icon-btn" onClick={() => navigate(-1)} aria-label={t('back')}>
            <ArrowLeft size={20} />
          </button>
        )}
      </div>
      <span className="navbar-logo" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {t('appName')}
      </span>
      <div className="navbar-actions">
        <Link to="/settings" aria-label={t('settings')}>
          <button className="icon-btn"><SettingsIcon size={20} /></button>
        </Link>
      </div>
    </nav>
  )
}
