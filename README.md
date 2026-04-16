# 🎮 Game Hub

> **Live:** [mcgamehub.vercel.app](https://mcgamehub.vercel.app)

A mobile-first Progressive Web App (PWA) bundling 10 games in a single installable app. Fully bilingual (FR/EN), 5 colour themes, automatic dark/light mode, and offline-capable thanks to a service worker.

---

## Table of Contents

1. [Games](#games)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Architecture](#architecture)
7. [PWA & Install](#pwa--install)
8. [Internationalisation](#internationalisation)
9. [Theming & Dark Mode](#theming--dark-mode)
10. [Deployment](#deployment)

---

## Games

| # | Game | FR name | EN name | Description |
|---|------|---------|---------|-------------|
| 1 | 🟩 Motus | Motus | Motus | Guess the hidden 5-letter word in 6 tries. Green = correct position, yellow = wrong position. Words fetched from a public word list (7-day localStorage cache), 150+ offline fallback words. AZERTY/QWERTY keyboards per language. |
| 2 | 🔗 Catégories | Catégories | Categories | Find the 4 hidden categories linking 16 words. 4 attempts allowed. Colour-coded difficulty (yellow → purple). Shuffle button available. |
| 3 | 🔢 Le Compte est Bon | Le Compte est Bon | Countdown | Use 6 numbers (big + small) and basic arithmetic to reach a 3-digit target. 30-second timer. Hint solver + undo. |
| 4 | 🃏 Solitaire | Solitaire | Solitaire | Classic Klondike Solitaire. Drag-and-drop + tap-to-move. Undo, hint, and new game. |
| 5 | 🟦 2048 | 2048 | 2048 | Swipe to merge tiles and reach 2048. Swipe gestures on mobile, arrow keys on desktop. |
| 6 | 🪢 Pendu | Pendu | Hangman | Guess the word letter by letter (6 wrong guesses allowed). Words fetched from `api.datamuse.com` with definition hint from `api.dictionaryapi.dev`. 200+ FR offline fallback words in 4 length buckets (5–8 letters). |
| 7 | 🐍 Snake | Snake | Snake | Classic Snake. D-pad on mobile, arrow keys on desktop. Swipe gesture support. |
| 8 | 🧠 Memory | Memory | Memory | Flip cards to find all matching emoji pairs. 3 difficulty levels: Easy (3×4, 6 pairs), Medium (4×4, 8 pairs), Hard (4×5, 10 pairs). Stars display, timer, win screen with "Next level". |
| 9 | 🔢 Sudoku | Sudoku | Sudoku | Standard 9×9 Sudoku. Number picker, validation, hint system. |
| 10 | 💣 Démineur | Démineur | Minesweeper | Minesweeper. Long-press or right-click to place a flag. |

---

## Features

- **Installable PWA** — works offline, appears on home screen like a native app
- **QR code install flow** — scan from Settings to instantly trigger the install prompt (Android) or show step-by-step guide (iOS)
- **Bilingual** — full FR/EN translations, AZERTY/QWERTY keyboard layouts, language persisted in `localStorage`
- **5 colour themes** — Indigo (default), Ocean, Forest, Sunset, Candy — persisted in `localStorage`
- **Auto dark/light mode** — dark 20:00–07:00, light 07:00–20:00; or manually force light/dark; re-checks every minute at the boundary
- **Mobile-first** — no page scrolling on game screens, viewport-aware grid sizing, swipe gestures
- **Offline word caching** — Motus word list cached for 7 days in `localStorage`, falls back to built-in lists when offline

---

## Tech Stack

| Layer | Library / Tool | Version |
|-------|---------------|---------|
| UI framework | React | 18.3.1 |
| Build tool | Vite | 5.4.8 |
| Routing | react-router-dom | 6.26.2 |
| Icons | lucide-react | 1.8.0 |
| QR code | qrcode.react | 4.2.0 |
| PWA | vite-plugin-pwa | 0.20.5 |
| Image processing | sharp (dev) | 0.34.5 |
| Hosting | Vercel | — |

External APIs (with offline fallback):
- `api.datamuse.com` — random 5-letter English words for Hangman
- `api.dictionaryapi.dev` — word definitions for Hangman hints
- `raw.githubusercontent.com/tabatkins/wordle-list` — English Motus word list
- `raw.githubusercontent.com/lorenbrichter/Words` — French Motus word list

---

## Project Structure

```
src/
├── App.jsx                   # Root — router, beforeinstallprompt listener
├── main.jsx
├── components/
│   ├── Navbar.jsx            # Top nav (Home + Settings links)
│   └── InstallGate.jsx       # PWA install bottom sheet (triggered by ?install=1)
├── contexts/
│   ├── ThemeContext.jsx       # Theme + dark mode state, CSS variable injection
│   └── LangContext.jsx        # FR/EN language state + t() helper
├── i18n/
│   └── translations.js        # All UI strings in FR and EN
├── pages/
│   ├── Home.jsx               # Game grid / launcher
│   └── Settings.jsx           # Theme picker, dark mode, language, QR install
├── games/
│   ├── wordle/                # Motus — WordlePage.jsx, words.js, wordLoader.js
│   ├── connections/           # Catégories — ConnectionsPage.jsx, puzzles.js
│   ├── compte/                # Le Compte est Bon — ComptePage.jsx
│   ├── solitaire/             # Solitaire — SolitairePage.jsx
│   ├── g2048/                 # 2048 — Game2048Page.jsx
│   ├── hangman/               # Pendu — HangmanPage.jsx
│   ├── snake/                 # Snake — SnakePage.jsx
│   ├── memory/                # Memory — MemoryPage.jsx
│   ├── sudoku/                # Sudoku — SudokuPage.jsx
│   └── minesweeper/           # Démineur — MinesweeperPage.jsx
└── styles/
    ├── themes.css             # CSS variables for all 5 themes × light/dark
    └── app.css                # Component styles
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build → dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## Architecture

### State management
No external state library. Each game is self-contained with local `useState`/`useEffect`. Two global contexts handle cross-cutting concerns:

- **`ThemeContext`** — active theme (`default | ocean | forest | sunset | candy`), dark mode (`auto | light | dark`), injects `data-theme` and `data-dark` attributes on `<html>`
- **`LangContext`** — active language (`fr | en`), exposes `t(key)` translation helper

### Memory grid sizing (no-scroll formula)
The Memory grid fits the viewport without scrolling using:
```css
width: min(
  calc((100vh - 180px) * colsOverRows),  /* height-constrained */
  calc(100vw - 24px),                     /* width-constrained  */
  hardCapPx                               /* absolute max        */
);
```

### Word loading (Motus)
1. Check `localStorage` cache (`gamehub_wordlist_v1_<lang>`) — valid for 7 days
2. If stale or absent, fetch from GitHub raw source
3. On any network failure, fall back to built-in word arrays

### PWA install flow
`App.jsx` listens for `beforeinstallprompt` and stores it in `window.__pwaPrompt`. The QR code in Settings encodes `https://mcgamehub.vercel.app?install=1`. `InstallGate.jsx` detects this param and:
- **Android** — fires `window.__pwaPrompt.prompt()` immediately
- **iOS** — shows a bottom sheet with Safari "Share → Add to Home Screen" steps
- **Already installed** — redirects to `/` instantly

---

## PWA & Install

The app is fully installable as a PWA:

- **Manifest** — name: "Game Hub", short_name: "Games", display: standalone, orientation: portrait, theme: `#6366f1`
- **Service worker** — `generateSW` mode via Workbox, auto-updates on new deploy
- **Icons** — `pwa-192.png`, `pwa-512.png` (maskable), `apple-touch-icon.png`
- **iOS meta** — `apple-mobile-web-app-capable` + `mobile-web-app-capable`

To install manually:
- **Android Chrome** — tap the install banner or ⋮ → "Add to Home Screen"
- **iOS Safari** — tap ⬆ Share → "Sur l'écran d'accueil" / "Add to Home Screen"

---

## Internationalisation

All strings live in `src/i18n/translations.js` under `fr` and `en` keys. The `useLang()` hook exposes `t(key)` anywhere in the app. Language is stored in `localStorage` under the key `lang`.

Keyboard layouts swap automatically: AZERTY for FR, QWERTY for EN (Motus).

---

## Theming & Dark Mode

CSS variables are defined in `themes.css` using `[data-theme="x"][data-dark="true/false"]` selectors. Switching theme or dark mode updates the `<html>` attributes; no class toggling required.

Dark mode schedule: dark from **20:00** to **07:00**, checked every 60 seconds. User can override to always-light or always-dark via the Settings toggle.

---

## Deployment

Hosted on **Vercel** with automatic deploys.

```bash
# Deploy to production
npx vercel --prod --yes

# Re-alias to custom domain after deploy
npx vercel alias set wordle-self-sigma.vercel.app mcgamehub.vercel.app
```

Primary URL: `https://mcgamehub.vercel.app`
