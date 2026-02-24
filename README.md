# MathChrono 🧮

A daily math quiz app built for kids. 20 questions, 2 minutes, every night.

Designed for a 10-year-old learning multiplication and division tables progressively — one new set of numbers each week. Runs entirely in the browser with no backend or database required.

---

## Features

- **Timed quiz** — 20 questions in 2 minutes, with a live countdown bar
- **Weekly progression** — 11 predefined stages, from ×{0, 10} up to full multiplication and division tables
- **3 difficulty levels** — Easy (numbers 1–5), Medium (all 0–10), Hard (numbers 4–10)
- **No duplicate questions** — `0×5` and `5×0` are treated as the same; every stage number is guaranteed to appear at least once per quiz
- **Custom numpad** — large tap-friendly numpad optimised for iPad (no native keyboard popup)
- **Weekly dashboard** — home screen shows this week's quiz count, best score, and average; resets every Friday at 17:00
- **Results history** — all past quizzes saved locally with score, time, stage and difficulty
- **Parent settings page** — change the active stage and difficulty at `/settings`
- **PWA ready** — can be added to the iPad/iPhone home screen for a full-screen app experience
- **Fully in French**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite |
| Styling | Tailwind CSS v4 |
| State | Pinia + `pinia-plugin-persistedstate` (localStorage) |
| Routing | Vue Router 4 |
| Hosting | Vercel (free static site) |
| Data | Hardcoded in source — no backend, no database |

---

## Project Structure

```
MathChrono/
├── frontend/
│   ├── src/
│   │   ├── data/
│   │   │   └── stages.js          # All 11 stages + 3 difficulties + question generator
│   │   ├── stores/
│   │   │   └── appStore.js        # Pinia store — active stage, difficulty, results history
│   │   ├── views/
│   │   │   ├── HomeView.vue       # Dashboard with weekly stats
│   │   │   ├── QuizView.vue       # Live quiz with custom numpad
│   │   │   ├── ResultView.vue     # Score + answer breakdown after each quiz
│   │   │   ├── ResultsHistoryView.vue  # /results — full history table
│   │   │   └── SettingsView.vue   # /settings — stage + difficulty selector
│   │   ├── router/index.js
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── public/
│   │   └── manifest.json          # PWA manifest
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── vercel.json                    # Vercel build + SPA routing config
├── DEPLOYMENT.md                  # Step-by-step deployment guide
└── README.md
```

---

## Stages

| Stage | Name | Content |
|---|---|---|
| 1 | Semaine 1 | × {0, 10} |
| 2 | Semaine 2 | × {0, 2, 10} |
| 3 | Semaine 3 | × {0, 2, 5, 10} |
| 4 | Semaine 4 | × {0, 1, 2, 5, 10} |
| 5 | Semaine 5 | × {0, 1, 2, 3, 5, 10} |
| 6 | Semaine 6 | × {0, 1, 2, 3, 4, 5, 10} |
| 7 | Semaine 7 | × {0–6, 10} |
| 8 | Semaine 8 | × {0–7, 10} |
| 9 | Semaine 9 | × {0–8, 10} |
| 10 | Semaine 10 | × {0–10} |
| 11 | Semaine 11 | × + ÷ {0–10} |

## Difficulty Levels

| Level | Numbers used | Description |
|---|---|---|
| 🟢 Facile | 1–5 | Easy combinations only |
| 🟡 Moyen | 0–10 | All numbers (default) |
| 🔴 Difficile | 4–10 | Harder combinations only |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18 or later

### Run locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
cd frontend
npm run build
# Output is in frontend/dist/
```

---

## Routes

| Route | Description |
|---|---|
| `/` | Home — weekly stats and start button |
| `/quiz` | Active quiz |
| `/result` | Score and answer review after a quiz |
| `/results` | Full quiz history |
| `/settings` | Parent page — change stage and difficulty |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide.

**Short version:**
1. Push the repo to GitHub
2. Import into [Vercel](https://vercel.com) — no environment variables needed
3. Vercel reads `vercel.json` and deploys automatically
4. Share the URL with your child

> All quiz history is stored in the browser's `localStorage`. It persists across visits on the same device but does not sync between devices.

---

## iPad / Mobile

- Custom numpad replaces the native keyboard — no keyboard popup during quizzes
- `touch-action: manipulation` on all buttons eliminates the 300ms tap delay
- `maximum-scale=1.0` prevents accidental zoom
- PWA manifest included — open the site in Safari on iPad, tap **Share → Add to Home Screen** for a full-screen app experience
