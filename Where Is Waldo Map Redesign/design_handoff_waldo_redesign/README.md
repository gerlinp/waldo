# Handoff: Where's Waldo — Choose a Map / Home Redesign

## Overview
Visual redesign of the Home screen and Choose-a-Map screen for the existing Where's Waldo game. This is **not** a separate prototype in a different framework — it's a direct edit of your existing plain HTML/CSS/JS app (same files: `index.html`, `style.css`, `app.js`, `puzzles.js`). You can drop these files straight into your repo, overwriting the originals.

## How to apply
1. Copy `index.html`, `style.css`, `app.js`, `puzzles.js` from this folder into the root of your `waldo` project, overwriting the existing files.
2. Everything else (images, `tools/coord-finder.html`, game-view zoom/pan logic) is unchanged — no other files need to move.
3. Open `index.html` and confirm fonts load (uses Google Fonts: Titan One + Baloo 2, linked in `<head>`).

## What changed

### Global
- Added Google Fonts **Titan One** (display/headline font) and **Baloo 2** (body/UI font), replacing system UI fonts everywhere (`body`, `.site-header h1`, `.tagline`, `.btn`, `.stamp-btn`, `#game-title`).
- New CSS variables in `:root`: `--wally-blue` (#3aa5dd), `--wally-blue-dark` (#1c6f9e), `--sky-blue` (#5fc0ea).
- `body` background changed from cream (`--cream`, #fdf6e3) to `--sky-blue` (#5fc0ea) — this is the background visible behind the Choose-a-Map grid.

### Home screen (`#home-view`)
- Background changed from solid black to a full-bleed diagonal red/white candy-stripe pattern (`repeating-linear-gradient(-45deg, var(--red) 0 70px, #fff 70px 140px)`), evoking Waldo's shirt. Sits behind the cover image and the two stamp buttons.

### Choose a Map screen (`#puzzle-list-view`)
- Replaced the plain "← Home" text button + bare grid with a themed header:
  - A diagonal red/white stripe bar above and below the content (`.stripe-bar`).
  - A round "stamp" style Home button (`.stamp-btn-small`, blue dashed border) matching the home screen's button language.
  - A two-tone display title, "**Choose**" in Wally blue / "**a Map**" in red, Titan One font with a black outline (`-webkit-text-stroke`) and drop shadow, mimicking the logo art.
  - A tagline "🔍 Pick a scene and find him!" in blue Baloo 2.
- Puzzle cards (`.puzzle-card`) redesigned as postcards/stamps:
  - White card, black border, rounded corners, lifts and rotates slightly on hover (alternating tilt direction by even/odd card), hover shadow tinted blue.
  - Image sits in a white "stamp" frame with a dashed blue bottom border.
  - Difficulty label changed from a pill badge to a rotated ink-stamp tag (`.difficulty-stamp`) pinned to the top-right corner of the image, dashed border in the difficulty's ink color (green/amber/orange/red), cream stamp background.
  - Card title uses Baloo 2 bold.

### Unchanged
- Game view (zoom/pan/minimap), all interaction logic in `app.js` (pointer/touch handling, momentum panning, keyboard shortcuts), and puzzle data/images.

## Design tokens
- Red: `#d81e2c`
- Cream (legacy, still used for stamp backgrounds): `#fdf6e3`
- Ink/black: `#1c1c1c`
- Wally blue: `#3aa5dd`
- Wally blue (dark): `#1c6f9e`
- Sky blue (page bg): `#5fc0ea`
- Fonts: "Titan One" (display), "Baloo 2" (UI/body), both via Google Fonts

## Files in this bundle
- `index.html` — full page markup (home / choose-map / game views)
- `style.css` — all styles
- `app.js` — unchanged interaction logic + updated `renderList()` card markup
- `puzzles.js` — puzzle data (unchanged)
