import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import {
  Keyboard, Network, Calculator, Spade,
  Layers, User, Zap, Brain, Grid3x3, Bomb, Gamepad2
} from 'lucide-react'

const GAMES = [
  { key: 'wordle',       path: '/wordle',       Icon: Keyboard,    titleKey: 'wordleTitle',       descKey: 'wordleDesc',       badge: 'Motus'   },
  { key: 'connections',  path: '/connections',  Icon: Network,     titleKey: 'connectionsTitle',  descKey: 'connectionsDesc',  badge: 'Catég.'  },
  { key: 'compte',       path: '/compte',       Icon: Calculator,  titleKey: 'compteTitle',       descKey: 'compteDesc',       badge: 'TV'      },
  { key: 'solitaire',    path: '/solitaire',    Icon: Spade,       titleKey: 'solitaireTitle',   descKey: 'solitaireDesc',    badge: 'Classic' },
  { key: '2048',         path: '/2048',         Icon: Layers,      titleKey: 'g2048Title',        descKey: 'g2048Desc',        badge: '2048'    },
  { key: 'hangman',      path: '/hangman',      Icon: User,        titleKey: 'hangmanTitle',      descKey: 'hangmanDesc',      badge: 'Word'    },
  { key: 'snake',        path: '/snake',        Icon: Zap,         titleKey: 'snakeTitle',        descKey: 'snakeDesc',        badge: 'Arcade'  },
  { key: 'memory',       path: '/memory',       Icon: Brain,       titleKey: 'memoryTitle',       descKey: 'memoryDesc',       badge: 'Memory'  },
  { key: 'sudoku',       path: '/sudoku',       Icon: Grid3x3,     titleKey: 'sudokuTitle',       descKey: 'sudokuDesc',       badge: 'Puzzle'  },
  { key: 'minesweeper',  path: '/minesweeper',  Icon: Bomb,        titleKey: 'minesweeperTitle',  descKey: 'minesweeperDesc',  badge: 'Classic' },
]

export default function Home() {
  const { t } = useLang()

  return (
    <div className="home">
      <h1 className="home-title"><Gamepad2 size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />{t('games')}</h1>
      <p className="home-sub">10 {t('games')} • Multithèmes • FR / EN</p>
      <div className="games-grid">
        {GAMES.map(g => (
          <Link key={g.key} to={g.path} className="game-card">
            <div className="game-card-icon"><g.Icon size={36} strokeWidth={1.5} /></div>
            <div className="game-card-name">{t(g.titleKey)}</div>
            <div className="game-card-desc">{t(g.descKey)}</div>
            <span className="game-card-badge">{g.badge}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
