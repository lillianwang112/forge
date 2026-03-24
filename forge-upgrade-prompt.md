# Forge 2.0 — Complete Upgrade Prompt for Claude Code

> **How to use**: Copy this entire prompt and paste it into Claude Code at the root of your `forge` repo. It's designed to be executed in phases. You can run the whole thing, or tell Claude Code to execute one phase at a time.

---

## Context

You are upgrading **Forge** (https://github.com/lillianwang112/forge), a code learning environment for Python & Julia scientific computing. It's a React 18 + Vite 6 PWA deployed at `lillianwang112.github.io/forge/`.

The app has:
- Monaco editor with split-pane layout
- 3 curriculum tracks: Python (12 lessons), Julia (10 lessons), Shared Engineering (6 lessons)
- SRS flashcard review system (SM-2 spaced repetition)
- AI feedback via Puter.js (Claude Sonnet)
- IndexedDB persistence, PWA offline support

The owner is a Princeton freshman preparing for a summer internship at the **ZERO Lab** under Prof. Jesse Jenkins, working on **MacroEnergy.jl** — an energy systems optimization framework written in Julia. The curriculum should directly prepare her for this work.

**Your mission**: Upgrade Forge by 10 notches across curriculum depth, UI polish, and feature completeness. Make it a genuinely impressive learning platform that could serve as a portfolio piece.

---

## Phase 1: Curriculum Expansion (HIGHEST PRIORITY)

### 1A. Expand the Python Track from 12 → 20 lessons

Add these 8 new lessons after the existing 12, maintaining the exact same JSON schema (see `src/curriculum/schema.js`). Each lesson needs: `id`, `title`, `order`, `starterCode`, `content` (rich markdown with LaTeX via `$$...$$`), and 2–3 `challenges` each with `testCases`.

**New Python Lessons (py-13 through py-20):**

| # | ID | Title | Topics |
|---|-----|-------|--------|
| 13 | py-13 | **ODE Integration** | Euler method, RK4, `scipy.integrate.solve_ivp`, stiff vs non-stiff, energy system dynamics (generator ramp rates, storage charge/discharge) |
| 14 | py-14 | **Linear Programming** | `scipy.optimize.linprog`, standard form, economic dispatch (minimize generation cost subject to demand constraints), duality intuition |
| 15 | py-15 | **Time Series & Signals** | `np.fft.fft`, spectral analysis, rolling windows, autocorrelation, analyzing renewable generation patterns (solar/wind intermittency) |
| 16 | py-16 | **NetworkX & Graph Theory** | `networkx` basics, adjacency matrices, shortest path, modeling power grids as graphs (buses, branches, flows), connected components |
| 17 | py-17 | **Constraint Optimization with PuLP** | `pulp` for MILP, decision variables, constraints, objective functions, unit commitment problem (which generators to turn on/off) |
| 18 | py-18 | **File I/O & Data Formats** | CSV/JSON/HDF5 reading, `pathlib`, `argparse` for CLI scripts, processing energy datasets (EIA, NREL ATB), data cleaning pipelines |
| 19 | py-19 | **Parallel & Async Patterns** | `concurrent.futures`, `multiprocessing` basics, async/await conceptual, why parallelism matters for large-scale energy models |
| 20 | py-20 | **Capstone: Mini Energy Model** | Tie it all together: build a simplified capacity expansion model — minimize total cost of meeting demand over a year with solar, wind, gas, and storage. Use `scipy.optimize.linprog`. This is a baby version of what MacroEnergy.jl does. |

**Content guidelines for each lesson:**
- The `content` field should be 40–80 lines of markdown with clear headers, code examples, and LaTeX math where relevant
- Include a "Why this matters for energy systems" or "ZERO Lab connection" subsection in each lesson
- Starter code should be runnable and demonstrate the key concepts (remember: Python runs via Pyodide in-browser, so only packages available in Pyodide can be used — NumPy, SciPy, Pandas, matplotlib are available. NetworkX and PuLP are NOT available in Pyodide by default, so for lessons py-16 and py-17, implement the algorithms from scratch using NumPy rather than importing those libraries)
- Each challenge should have 2–3 test cases (mix of visible and hidden), following the existing pattern: `appendCode` calls the student's function and `print()`s the result, `expectedOutput` is the exact string match

### 1B. Expand the Julia Track from 10 → 18 lessons

Add 8 new lessons (ju-11 through ju-18):

| # | ID | Title | Topics |
|---|-----|-------|--------|
| 11 | ju-11 | **DifferentialEquations.jl Concepts** | ODE problem setup, `ODEProblem`, `solve()`, callbacks, modeling physical systems. (Since we can't import DiffEq in Wandbox, teach the concepts with manual RK4 implementation) |
| 12 | ju-12 | **Optimization.jl Patterns** | `Optimization.jl` interface patterns, `OptimizationFunction`, gradient-based vs derivative-free, economic dispatch in Julia |
| 13 | ju-13 | **DataFrames.jl** | `DataFrame` construction, `select`, `filter`, `groupby`, `combine`, `innerjoin`, processing tabular energy data |
| 14 | ju-14 | **Metaprogramming & Macros** | Expressions, `quote`, `@macro`, `@time`, `@assert`, AST manipulation, understanding how JuMP's `@constraint` works under the hood |
| 15 | ju-15 | **Package Development** | `Pkg.generate`, Project.toml, module structure, `export`, `include`, testing with `Test`, how MacroEnergy.jl is organized |
| 16 | ju-16 | **JuMP.jl Modeling Concepts** | Mathematical programming with JuMP syntax patterns, `@variable`, `@constraint`, `@objective`, LP/MILP formulation (teach the API patterns even if JuMP can't run in Wandbox — implement equivalent logic manually) |
| 17 | ju-17 | **Performance Deep Dive** | Type stability, `@code_warntype`, heap vs stack allocation, `StaticArrays`, benchmarking with `@btime`, avoiding common performance pitfalls in scientific Julia |
| 18 | ju-18 | **Capstone: Energy System Optimizer** | Build a simplified capacity expansion solver in pure Julia — define generation types (solar, wind, gas, storage), time series demand, minimize cost subject to constraints. Manual LP via iterative methods. Direct prep for MacroEnergy.jl contribution. |

### 1C. Expand the Shared Track from 6 → 12 lessons

Add 6 new lessons (sh-7 through sh-12):

| # | ID | Title | Topics |
|---|-----|-------|--------|
| 7 | sh-7 | **Numerical Stability** | Floating-point representation, catastrophic cancellation, condition numbers, backward stability, comparing `1e-15` values correctly |
| 8 | sh-8 | **Complexity Analysis** | Big-O, Big-Θ, amortized analysis, space complexity, why sparse solvers are O(nnz) not O(n²), profiling mental models |
| 9 | sh-9 | **Design Patterns for Scientific Code** | Strategy pattern, factory pattern, observer pattern — applied to solver selection, model configuration, event-driven simulation |
| 10 | sh-10 | **Reproducible Research** | Seeds, environment pinning, `requirements.txt` vs `Project.toml`, containerization concepts, experiment logging, why reproducibility matters for energy policy modeling |
| 11 | sh-11 | **Technical Writing** | Writing clear docstrings, READMEs, issue descriptions, PR descriptions, commit messages. How to write a methods section. LaTeX equation formatting. |
| 12 | sh-12 | **Open Source Contribution** | Fork → branch → PR workflow, reading existing codebases, finding good first issues, code review etiquette, how to contribute to MacroEnergy.jl specifically |

### 1D. Expand SRS Concept Cards

Expand each concept JSON file in `content/concepts/`:

- `python-concepts.json`: Add 20 more cards covering NumPy broadcasting rules, SciPy solver selection, Pandas method chaining, LP standard form, FFT interpretation, and the new lesson topics
- `julia-concepts.json`: Add 20 more cards covering multiple dispatch patterns, type stability rules, broadcasting dot syntax, Julia vs Python gotchas, JuMP modeling patterns
- `shared-concepts.json`: Add 15 more cards covering floating-point gotchas, Big-O common complexities, git rebase vs merge, PR review checklist items

Each card follows the existing schema:
```json
{
  "conceptId": "unique-id",
  "front": "Question text?",
  "back": "Answer with code examples in markdown",
  "category": "Category Name",
  "track": "python|julia|shared",
  "relatedLessons": ["lesson-id"]
}
```

---

## Phase 2: UI/UX Overhaul

### 2A. Design System Refresh

The current app uses CSS custom properties. Upgrade the visual identity:

1. **Typography**: Replace generic fonts. Use **JetBrains Mono** for code and the editor. Use **DM Sans** for UI text (this matches her portfolio site). Add via Google Fonts CDN in `index.html`.

2. **Color palette refinement** — update CSS variables in `src/styles/globals.css`:
   - Keep the dark theme as primary
   - Accent colors: Python green `#3fb950`, Julia purple `#a371f7`, Shared blue `#58a6ff`, plus a warm accent `#f0883e` for warnings/highlights
   - Add a subtle noise texture overlay on the sidebar background (CSS `background-image` with SVG data URI)
   - Improve contrast ratios for accessibility (WCAG AA minimum)

3. **Motion & polish**:
   - Add staggered fade-in animations on the Dashboard track cards (use CSS `@keyframes` + `animation-delay`)
   - Smooth page transitions when navigating between routes (simple CSS opacity/transform transitions)
   - Add a subtle hover lift effect on all clickable cards (translateY + box-shadow transition)
   - Progress bars should animate when they fill (CSS transition on width)

### 2B. Dashboard Upgrade

Redesign `src/pages/Dashboard.jsx`:

1. Replace the flat "Sandbox" heading with a **hero section** that shows:
   - A greeting: "Welcome back to Forge" (or time-appropriate: "Good morning", "Good evening")
   - Overall stats bar: `X / Y lessons completed` across all tracks, with a thin animated progress bar
   - Current streak indicator (consecutive days with activity, stored in IndexedDB)

2. **Track cards** should show:
   - Circular progress ring (SVG) showing completion percentage
   - Lesson count: "7 / 12 lessons"
   - Next lesson title
   - Estimated time remaining (rough: 15 min per incomplete lesson)

3. **Quick actions row** below the tracks:
   - "Continue Learning" → goes to next incomplete lesson
   - "Review Due Cards" → goes to `/review` with badge showing due count
   - "Open Sandbox" → scrolls down to the sandbox editor

4. Keep the sandbox editor at the bottom of the Dashboard, but collapse it by default with an expandable section header

### 2C. Lesson Page Improvements

Upgrade `src/pages/LessonPage.jsx` and related components:

1. **Table of contents sidebar** within the lesson content panel — auto-generated from `##` headers in the markdown content, with scroll-spy highlighting

2. **Challenge progress indicator** — show checkmarks next to completed challenges in the lesson view

3. **"Run Example" buttons** — for code blocks in the lesson content markdown, add a button that loads that code snippet into the editor. Modify `MarkdownRenderer.jsx` to detect fenced code blocks and add an "Open in Editor" button overlay.

4. **Breadcrumb navigation** at the top: `Track → Lesson → Challenge`

### 2D. New Page: Progress Analytics

Create `src/pages/ProgressPage.jsx` (add route `/progress`):

1. **Completion heatmap** — a GitHub-style contribution graph showing daily coding activity (lessons completed, challenges solved) over the past 12 weeks. Data comes from IndexedDB timestamps.

2. **Per-track breakdown** — bar chart (rendered as styled divs, no charting library needed) showing completion per track

3. **SRS stats panel** — cards due today, total cards learned, retention rate estimate

4. **Milestones timeline** — list of achievements: "Completed Python Track", "First Julia Challenge", "10-day streak", etc.

Add a nav link to this page in `src/components/layout/Sidebar.jsx`.

---

## Phase 3: Engine & Infrastructure Improvements

### 3A. Code Execution Improvements

1. **Pyodide upgrade**: In `src/engines/python/pyodideRunner.js`, add automatic installation of `micropip` packages when a lesson's starter code imports them. Add a loading indicator: "Installing scipy..." during first load.

2. **Execution timeout**: Add a 30-second timeout to both Python and Julia execution. Show a friendly error: "Your code took too long. Check for infinite loops!"

3. **Output improvements**: In `OutputPanel.jsx`, add:
   - Syntax highlighting for error tracebacks (color the file/line references)
   - A "Copy Output" button
   - Scroll-to-bottom behavior when new output arrives during execution

### 3B. AI Feedback Enhancements

1. **Contextual prompts**: Update `src/ai/prompts/pythonReview.js` and `juliaReview.js` to include lesson context. When reviewing code for a specific challenge, the prompt should mention what the challenge is testing and suggest approaches specific to that topic.

2. **Hint system upgrade**: In `src/components/feedback/HintSystem.jsx`, implement a 3-tier progressive hint system:
   - Hint 1: Conceptual nudge ("Think about what NumPy function computes cumulative sums")
   - Hint 2: Structural hint ("Your function should use `np.cumsum` and then divide by an index array")
   - Hint 3: Near-solution ("The index array is `np.arange(1, len(arr) + 1)`")
   
   Store hints in the challenge JSON as an optional `hints` array field. Add hints to at least the first 5 challenges in each track.

### 3C. Keyboard Shortcuts

Expand `src/components/layout/KeyboardShortcutsModal.jsx`:
- `Ctrl/Cmd + Enter` → Run code (already exists)
- `Ctrl/Cmd + S` → Save snapshot
- `Ctrl/Cmd + Shift + F` → AI Feedback
- `Ctrl/Cmd + [` / `]` → Previous / Next lesson
- `Ctrl/Cmd + B` → Toggle sidebar
- `Escape` → Close any modal

Wire all shortcuts up in the `Shell.jsx` layout component using a `useEffect` with `keydown` listener.

---

## Phase 4: Content Quality Details

### 4A. Energy Systems Thread

Weave a consistent narrative through the curriculum that builds toward understanding MacroEnergy.jl:

1. Every Python lesson from py-5 onward should include at least one challenge or example framed in terms of energy systems (e.g., "Optimize generator dispatch", "Analyze wind speed time series", "Model battery storage constraints")

2. Every Julia lesson from ju-5 onward should reference Julia ecosystem tools relevant to ZERO Lab work

3. The capstone lessons (py-20, ju-18) should explicitly reference MacroEnergy.jl concepts:
   - Generation resources (solar, wind, natural gas, nuclear)
   - Storage (batteries, pumped hydro)
   - Demand time series (hourly over a year = 8760 hours)
   - Capacity expansion: decide how much of each resource to build
   - The objective: minimize total system cost (capital + operating) while meeting demand every hour

### 4B. Cross-references

Add a `prerequisites` field to lessons that have them (optional array of lesson IDs). Display these as links at the top of the lesson content: "Prerequisites: NumPy Arrays (py-2), SciPy Linear Algebra (py-4)"

### 4C. Difficulty Tags

Add a `difficulty` field to each challenge: `"easy"`, `"medium"`, or `"hard"`. Display as a colored badge on `ChallengeCard.jsx`:
- Easy: green
- Medium: yellow  
- Hard: red/orange

---

## Phase 5: Polish & Deploy

### 5A. README Upgrade

Rewrite `README.md` to be a proper portfolio-quality README:
- Hero section with app name, one-line description, and badges
- Screenshot placeholder (add comment: `<!-- TODO: Add screenshot -->`)
- Feature list with emoji bullets
- Architecture overview (brief)
- Tech stack table
- "Curriculum" section listing all tracks with lesson counts
- Getting started instructions
- Deploy instructions
- Credits section mentioning ZERO Lab and Princeton

### 5B. SEO & Meta

Update `index.html`:
- Add Open Graph meta tags (title, description, image placeholder)
- Add `theme-color` meta tag matching the app's dark theme
- Update the `<title>` to "Forge — Scientific Computing Learning Environment"
- Add a `manifest.json` update with the new description

### 5C. Error Boundaries

Ensure `ErrorBoundary.jsx` catches and displays friendly errors for:
- Failed Pyodide loading
- Failed Julia (Wandbox) API calls
- Malformed curriculum JSON
- IndexedDB storage quota exceeded

---

## Implementation Notes

1. **File structure**: All curriculum JSON lives in `src/curriculum/tracks/`. Concept cards are in `content/concepts/`. Follow the existing patterns exactly.

2. **Testing**: After creating/modifying JSON files, validate them with `node -e "JSON.parse(require('fs').readFileSync('path'))"` to catch syntax errors.

3. **Pyodide compatibility**: The Python track runs in-browser via Pyodide. Available packages: numpy, scipy, pandas, matplotlib, scikit-learn, sympy. Do NOT use: networkx, pulp, cvxpy, or any package not in Pyodide's default set. For lessons that teach these tools conceptually, implement the algorithms from scratch using numpy/scipy.

4. **Julia execution**: Julia runs via Wandbox API (Julia 1.10.5). Only the standard library is available (LinearAlgebra, Statistics, Printf, Random, Test). Do NOT use external packages like DifferentialEquations.jl, JuMP.jl, DataFrames.jl in executable code. Teach the concepts but implement with stdlib.

5. **Commit strategy**: Make atomic commits per phase. Use conventional commits:
   - `feat: expand python track to 20 lessons`
   - `feat: add progress analytics page`
   - `style: refresh design system typography and colors`
   - `docs: upgrade README for portfolio quality`

6. **Don't break existing functionality**: The app should build and deploy correctly after each phase. Run `npm run build` after each major change to verify.

---

## Priority Order

If you need to prioritize, do them in this order:
1. **Phase 1A** (Python curriculum expansion) — biggest impact
2. **Phase 1B** (Julia curriculum expansion)
3. **Phase 1C** (Shared track expansion)
4. **Phase 2B** (Dashboard redesign)
5. **Phase 2A** (Design system refresh)
6. **Phase 1D** (SRS cards)
7. **Phase 4A** (Energy systems thread)
8. Everything else

Go ahead and start with Phase 1A. Build all 8 new Python lessons with full content, starter code, and challenges. Make the content genuinely educational — these should feel like they were written by someone who deeply understands both the math and the practical application to energy systems research.
