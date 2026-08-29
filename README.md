# Netflix Clone (Premium Single Page Application)

A visually stunning, high-fidelity Netflix clone built using modern **Vanilla HTML5**, **Vanilla CSS3 (with Custom Properties & Grid)**, and **Modern ES6 JavaScript**. 

This application focuses on recreating the authentic Netflix experience with smooth transitions, interactive carousels, detailed modals, profile routing, state persistence (like "My List"), and a fully custom simulated video player.

---

## 🌟 Key Features

1. **"Who's Watching?" Profile Selection**
   - Implements Netflix's classic profile selection intro screen.
   - Interactive hover cards scaling up with smooth animation.
   - Profile transitions: fades profile cards out and zooms the browse dashboard in.

2. **Dynamic Browse Dashboard & Categories**
   - Sticky navigation header that transitions from transparent to solid black on scroll.
   - Responsive Hero Billboard highlighting featured content with linear gradient vignettes.
   - Responsive horizontal scrolling rows grouped by genre/category (Trending, Action, Sci-Fi, Comedy).
   - Touch/Click scroll handles on rows that reveal on hover.

3. **High-Fidelity Interactive Movie Cards**
   - Hovering over cards scales them up (3D lift effect) and reveals a detailed drawer showing movie metadata (Match %, age rating, duration), call-to-actions, and genres.

4. **Detailed Modal Overlay**
   - Click on any title to trigger a detailed modal showing full synopsis, cast, and custom action controls.
   - **More Like This**: Recommends similar titles in the category. Clicking a recommendation details-shifts the modal smoothly.

5. **Integrated live Search & Filter**
   - Live query matching titles, descriptions, or genres dynamically.
   - Seamlessly collapses homepage rows to show matching cards in a responsive grid.

6. **Profile-Bound "My List" & Ratings**
   - Users can toggle titles into "My List".
   - Persists state in `localStorage` uniquely per profile, meaning "My List" survives page refreshes and differs for each viewer.
   - "My List" tab loads custom grids dynamically showing all added items.

7. **Custom Media Player Overlay**
   - Exit back button, title indicators, volume sliders, mute controls, time tracking, timeline scrubbers, rewind/forward controls, and full-screen controls.
   - Full keyboard controls: Space to play/pause, Arrow Left/Right to skip 10 seconds, F for fullscreen, M for mute, and Escape to close player.

---

## 🛠️ Tech Stack & Architecture

- **Core Structure**: HTML5 Semantic markup.
- **Styling System**: CSS3 custom variables (tokens), Flexbox, CSS Grid, Custom Transitions/Animations. No frameworks/compilers used, ensuring sub-millisecond page loads.
- **Client Logic**: ES6 modules (`import/export`), local state machine, localStorage synchronization.

---

## 🚀 How to Run Locally

Since this application uses native ES6 JavaScript modules (`import` / `export`), modern browsers require files to be served via an HTTP server rather than loaded via `file://`.

### Option 1: Live Server (VS Code)
1. Open the project in VS Code.
2. Click **Go Live** in the status bar (requires the "Live Server" extension).

### Option 2: Node.js (npx)
If you have Node.js installed, run:
```bash
npx serve .
# or
npx http-server .
```
Then open the displayed URL in your browser (usually `http://localhost:3000` or `http://localhost:8080`).

### Option 3: Python Server
Alternatively, you can start a simple server using Python:
```bash
# Python 3
python -m http-server 8000
```
Open `http://localhost:8000` in your web browser.
