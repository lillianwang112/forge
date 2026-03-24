# Forge 🔨

> **Scientific Computing Learning Environment** — master Python & Julia on the path to energy systems research

<!-- TODO: Add screenshot -->

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white&style=flat-square)
![Monaco](https://img.shields.io/badge/Monaco_Editor-0.45-007acc?logo=visualstudiocode&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white&style=flat-square)
![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8?logo=pwa&logoColor=white&style=flat-square)

**Live**: [lillianwang112.github.io/forge/](https://lillianwang112.github.io/forge/)

---

## Features

- 🐍 **Python Track** — 20 lessons: NumPy, SciPy, ODE integration, LP, time series, graph algorithms, and a full energy capacity expansion capstone
- 💜 **Julia Track** — 18 lessons: from syntax to multiple dispatch, type stability, DifferentialEquations.jl concepts, JuMP modeling, and a capstone LP solver
- ⚡ **Shared Engineering** — 12 lessons: Git, testing, numerical stability, complexity analysis, reproducible research, and open-source contribution workflows
- 🗂 **SRS Flashcards** — spaced-repetition review system (SM-2 algorithm) with 150+ concept cards across all tracks
- 🤖 **AI Code Review** — Claude-powered contextual feedback via Puter.js
- 📊 **Progress Analytics** — completion heatmap, per-track breakdown, milestones
- ✏️ **Monaco Editor** — full IDE experience with syntax highlighting and keyboard shortcuts
- 📱 **PWA** — installable, works offline, all progress stored in IndexedDB

---

## Curriculum

### 🐍 Python Track (20 lessons)

| # | Lesson | Topics |
|---|--------|--------|
| 1 | Python for Scientists | Dynamic typing, f-strings, functions |
| 2 | NumPy Arrays | ndarray, vectorization, boolean indexing |
| 3 | Broadcasting & Vectorization | Broadcasting rules, np.where, axis operations |
| 4 | SciPy Linear Algebra | Matrix decompositions, linear systems, eigenvalues |
| 5 | SciPy Optimization | minimize, gradient methods, constrained optimization |
| 6 | Pandas DataFrames | Series, DataFrame, groupby, merge |
| 7 | Pandas groupby & Merge | Aggregation, join types, multi-index |
| 8 | SciPy Spatial & Distances | KDTree, distance metrics, spatial queries |
| 9 | Clustering Algorithms | K-means, hierarchical, DBSCAN |
| 10 | Sparse Matrices | scipy.sparse, CSR/CSC formats, sparse solvers |
| 11 | Geospatial Basics | Coordinate systems, projections, distance formulas |
| 12 | Data Pipeline Design | Functional pipelines, caching, validation |
| 13 | **ODE Integration** | Euler, RK4, solve_ivp, energy storage dynamics |
| 14 | **Linear Programming** | linprog, economic dispatch, duality |
| 15 | **Time Series & Signals** | FFT, rolling windows, autocorrelation, renewables |
| 16 | **Graph Theory** | Adjacency matrix, BFS, power grid modeling |
| 17 | **Constraint Optimization** | Unit commitment, MILP formulation |
| 18 | **File I/O & Data Formats** | CSV, JSON, pathlib, energy dataset pipelines |
| 19 | **Parallel & Async Patterns** | concurrent.futures, threading, async/await |
| 20 | **Capstone: Mini Energy Model** | Full capacity expansion model with LP |

### 💜 Julia Track (18 lessons)

| # | Lesson | Topics |
|---|--------|--------|
| 1–10 | Julia fundamentals through Linear Algebra | Syntax, arrays, types, dispatch, stdlib |
| 11 | **DifferentialEquations.jl Concepts** | Manual RK4, ODE problem patterns |
| 12 | **Optimization.jl Patterns** | Gradient descent from scratch, economic dispatch |
| 13 | **DataFrames.jl** | Manual tabular operations, groupby, joins |
| 14 | **Metaprogramming & Macros** | Expr, quote, @time, AST, JuMP internals |
| 15 | **Package Development** | Project.toml, modules, exports, Test stdlib |
| 16 | **JuMP.jl Modeling Concepts** | LP formulation, @variable/@constraint patterns |
| 17 | **Performance Deep Dive** | Type stability, @code_warntype, @time, stack vs heap |
| 18 | **Capstone: Energy System Optimizer** | Manual LP capacity expansion in pure Julia |

### ⚡ Shared Engineering Track (12 lessons)

| # | Lesson | Topics |
|---|--------|--------|
| 1–6 | Git, docs, testing, validation, code review, debugging | Core software engineering skills |
| 7 | **Numerical Stability** | IEEE 754, catastrophic cancellation, condition numbers |
| 8 | **Complexity Analysis** | Big-O, sparse matrices, profiling mental models |
| 9 | **Design Patterns** | Strategy, factory, observer — applied to energy models |
| 10 | **Reproducible Research** | Seeds, environment pinning, experiment logging |
| 11 | **Technical Writing** | Docstrings, READMEs, LaTeX, methods sections |
| 12 | **Open Source Contribution** | Fork→PR workflow, MacroEnergy.jl contribution guide |

---

## Architecture

```
forge/
├── src/
│   ├── curriculum/tracks/   # JSON lesson data (Python, Julia, Shared)
│   ├── engines/             # Pyodide (Python) + Wandbox API (Julia)
│   ├── srs/                 # SM-2 spaced repetition scheduler
│   ├── ai/                  # Claude-powered code review via Puter.js
│   ├── storage/             # IndexedDB persistence layer
│   ├── pages/               # Dashboard, LessonPage, ReviewPage, ProgressPage
│   └── components/          # Editor, Sidebar, Flashcards, Feedback
├── content/concepts/        # SRS flashcard JSON (150+ cards)
└── public/                  # PWA manifest, icons
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 6 |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| Python runtime | Pyodide (WebAssembly, in-browser) |
| Julia runtime | Wandbox API (Julia 1.10.5) |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Storage | IndexedDB via `idb` |
| AI feedback | Puter.js → `claude-sonnet-4-6` |
| SRS algorithm | SM-2 spaced repetition |
| PWA | `vite-plugin-pwa` |

---

## Getting Started

```bash
git clone https://github.com/lillianwang112/forge.git
cd forge
npm install
npm run dev
# Open http://localhost:5173/forge/
```

## Deploy

```bash
npm run deploy   # builds and pushes to gh-pages branch
```

---

## Credits

Built to prepare for the **ZERO Lab** (Prof. Jesse Jenkins, Princeton University), contributing to **[MacroEnergy.jl](https://github.com/macroenergy/MacroEnergy.jl)** — an open-source energy systems optimization framework in Julia.

The curriculum is designed to build directly toward understanding capacity expansion modeling, JuMP.jl optimization, and energy data pipelines used in real policy research.
