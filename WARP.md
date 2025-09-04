# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quickstart (commands)
- Serve locally (static site):
  - Node: `npx http-server -a 127.0.0.1 -p 8080 -c-1`
  - Python: `python3 -m http.server 8080`
- iOS Safari requires HTTPS for camera. Easiest path is to test via GitHub Pages (see Live URLs). If you must test HTTPS locally, use any HTTPS-capable static server.
- Build: none (pure static site; HTML/CSS/JS with CDN libraries)
- Lint/tests: none configured in this repo

Entry points under a local server:
- Main (marker-based): `/`
- Admin (marker-based): `/admin.html`
- MindAR hunt (natural-image): `/mind-hunt.html`
- Admin (natural-image): `/admin-natural.html`

Live (GitHub Pages) if enabled for this repo:
- Main (marker-based): https://j7j7.github.io/ARHunt/
- Admin (marker-based): https://j7j7.github.io/ARHunt/admin.html
- MindAR hunt (natural-image): https://j7j7.github.io/ARHunt/mind-hunt.html
- Admin (natural-image): https://j7j7.github.io/ARHunt/admin-natural.html

## Big-picture architecture
ARHunt is a 100% client-side AR web app with two modes:
- Marker-based (A-Frame + AR.js): index.html + script.js
- Natural-image (MindAR): mind-hunt.html + mind-hunt.js
Each mode has an admin page for calibration/exporting overlay configuration.

Key pieces and how they work together:
- index.html (A-Frame + AR.js)
  - Loads A-Frame and AR.js via CDN.
  - Declares 10 <a-marker> entities (ids: triangle, square, rectangle, circle, star, pentagon, hexagon, diamond, heart, arrow), each with a child <a-plane class="overlay-plane">.
  - Preloads overlay images in <a-assets> from assets/overlays/*.svg.
- script.js (marker-based runtime)
  - On load, fetches assets/config.json (no-store) and applies per-marker settings: overlaySrc, width, height, position [x,y,z], rotation [x,y,z].
  - Subscribes to AR.js markerFound events; first-time detections increment a HUD counter and flash the overlay plane; upon reaching 10/10, shows a congrats overlay.
  - Controls UI overlays (menu, HUD, congrats) with simple DOM class toggles.
- admin.html + admin.js (marker calibration)
  - Same 10 markers as index.html.
  - UI to select a marker and live-edit overlaySrc, size, position, rotation; updates the corresponding <a-plane> immediately.
  - Can load a JSON config (merges into defaults) and can download the current config.json for committing to assets/config.json.
- mind-hunt.html (MindAR)
  - Uses MindAR’s A-Frame component with imageTargetSrc set to assets/targets/compiled/targets.mind (compiled separately with MindAR tools).
  - Declares up to 10 <a-entity mindar-image-target targetIndex=0..9>, each with an overlay-plane.
- mind-hunt.js (natural-image runtime)
  - Loads assets/config.json and reads config.naturalTargets (if present).
  - Applies per-target settings and listens for MindAR targetFound events to track progress and show congrats when all configured targets are found.
- admin-natural.html + admin-natural.js (natural-image calibration)
  - Camera capture utility to snapshot potential targets (download PNGs; you compile them into a .mind file externally).
  - Live preview scene that can optionally load a custom .mind file for this session.
  - UI to adjust overlay for a targetIndex and download a natural-config.json containing only the naturalTargets section to merge into assets/config.json.

External libraries (CDN):
- A-Frame 1.4.x
- AR.js (A-Frame build)
- MindAR (A-Frame build)

## Assets and configuration
- assets/config.json (consumed by both modes)
  - Marker keys (triangle, square, …): { overlaySrc, width, height, position [x,y,z], rotation [x,y,z] }
  - Optional naturalTargets: { "0": { overlaySrc, width, height, position, rotation }, … }
- assets/patterns/*.patt
  - Required by AR.js markers in index.html/admin.html. Generate with the AR.js Marker Generator; print the matching marker images for on-wall placement.
- assets/overlays/*.svg and assets/overlays/samples/*.svg
  - Overlay images used by both modes.
- assets/targets/compiled/targets.mind
  - Compiled MindAR targets file used by mind-hunt.html/admin-natural.html.

## Conventions and notes
- Update MEMORY.MD whenever you make meaningful changes (what changed and why).
- iOS Safari requires HTTPS for camera. Prefer testing via GitHub Pages. For local dev on iOS, use an HTTPS static server.
- Troubleshooting (from README): use the correct .patt files for printed markers; verify paths; adjust overlay plane Y slightly if it appears hidden; ensure marker size matches print size.

