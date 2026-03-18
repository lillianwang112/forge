# Forge 🔨

> A code learning environment for Python & Julia scientific computing

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white&style=flat-square)
![Monaco](https://img.shields.io/badge/Monaco_Editor-0.45-007acc?logo=visualstudiocode&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white&style=flat-square)
![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8?logo=pwa&logoColor=white&style=flat-square)

Built for ZERO Lab internship prep.

---

## Features

- **Monaco Editor** with custom dark theme, Python & Julia syntax highlighting
- **Split-pane** resizable layout (editor + output terminal)
- **SRS Review** — spaced-repetition flashcard system (Phase 3)
- **AI Feedback** — Claude-powered code review via Puter.js (Phase 4)
- **PWA** — installable, works offline
- **IndexedDB** — all progress and snapshots stored locally

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite 6 |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Storage | IndexedDB (`idb`) |
| AI | Puter.js (`claude-sonnet-4-6`) |
| PWA | `vite-plugin-pwa` |

## Getting Started

```bash
npm install
npm run dev
# Open http://localhost:5173/forge/
```

## Build

```bash
npm run build
# Output in dist/ — deploy to GitHub Pages under /forge/
```
