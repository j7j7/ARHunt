# MEMORY LOG

2025-08-29
- Created requirements.md detailing scope, goals, functional/non-functional requirements, acceptance criteria, risks, and deployment.
- Created plan.md describing architecture (A-Frame + AR.js, CDN), file structure, steps, Mermaid diagrams (user flow + component interaction), local dev/testing guidance, and GitHub Pages deployment.
- Decided v1 will use AR.js pattern markers for robust detection of simple shapes; mind-ar-js remains an option later for natural-image tracking.
- Next steps: scaffold index.html, styles.css, script.js; generate 10 .patt markers; add 10 overlay images; push to GitHub Pages for device testing.

2025-08-29
- Added initial scaffolding: index.html (A-Frame + AR.js scene, 10 placeholder markers, menu/HUD/congrats overlays), styles.css (fun theme, border, HUD, buttons), script.js (markerFound handling, HUD updates, menu/quit/restart logic).
- Created assets directories with .gitkeep: assets/patterns, assets/overlays, assets/markers.
- Pending: generate 10 pattern files (.patt), add 10 overlay PNGs, and printable markers; then test via GitHub Pages on iOS/Android.

2025-08-29
- Added admin.html and admin.js for calibration (overlay image, size, position, rotation) with config download/upload. Added assets/config.json and updated script.js to load/apply it. Switched overlays to SVG and created 10 shape SVGs.
- Next: Generate actual .patt files using AR.js generator, add printable markers, push and enable GitHub Pages, then test on iOS/Android.

2025-08-29
- Added natural image workflow: mind-hunt.html (MindAR-based hunt) and admin-natural.html (capture target photo, preview .mind, map overlays), with mind-hunt.js/admin-natural.js.
- Created assets/targets/captures and assets/targets/compiled with .gitkeep.
- Added 10 sample overlay images under assets/overlays/samples/.

2025-08-29
- Fixed admin and MindAR pages UI clickability: raised overlay z-index, disabled A-Frame loading screen on all scenes, and prevented loader overlays from intercepting pointer events via CSS.

2025-08-29
- Added README.md with a short summary and usage instructions (player + admin for marker-based and natural-image modes), links for Pages, troubleshooting, and credits.

