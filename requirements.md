# ARHunt — Requirements

## Overview
ARHunt is a browser-based, mobile-friendly AR “treasure hunt.” Using a phone’s camera, the app detects 10 predefined symbols placed around a room. When a symbol is detected, it’s highlighted and a flat AR “picture” appears anchored/oriented to the symbol so it looks fixed to the wall. The player is shown a congratulatory screen after finding all 10. No user accounts, scores, or data persistence are required.

Primary characteristics:
- 100% web-hosted; no app store installation.
- Must run on iOS Safari and Android Chrome.
- Simple, responsive UI; fun theme; minimal controls.
- Assets (AR overlays, marker patterns) are hosted on the same web server.

## Goals
- Let players quickly start a hunt from a simple start screen.
- Detect up to 10 target symbols reliably in typical indoor lighting.
- Render a flat AR image “stuck” to the wall at each symbol’s location with proper orientation.
- Track and display progress (e.g., “Found X/10”).
- Provide a final “Congratulations” screen when all 10 are found.

## Non-Goals
- User authentication, profiles, leaderboards, scoring, or persistence.
- Complex 3D content; initial overlays are flat images (2D planes).
- Offline operation.

## User Stories
- As a player, I want to see a friendly start screen that tells me to find symbols around the room and to start the camera.
- As a player, I want to scan the room and have detected symbols be highlighted and counted.
- As a player, I want a minimal HUD showing my progress and a quit button to return to the start menu.
- As a player, I want a celebratory screen once all 10 symbols are found.

## Functional Requirements
1. Start Menu
   - Welcome message and simple instructions (“Find 10 objects around the room”).
   - A prominent Start button to begin scanning.
   - Optional simple “How it works”/info text.
2. Camera + AR View
   - On Start, request camera permission and open the rear (environment) camera.
   - Display live camera feed with a minimal border.
   - Detect 10 predefined symbols (triangle, square, rectangle, circle, star, pentagon, hexagon, diamond, heart, arrow). Symbols will be realized as printable pattern markers for reliable detection.
   - On first detection of a given symbol:
     - Visually highlight the detection briefly (flash/outline).
     - Display a flat image overlay (2D plane) anchored to the symbol with stable orientation.
     - Update the HUD counter.
   - Continue scanning for remaining symbols.
3. Progress + Congrats
   - HUD shows “Found X/10”.
   - When X reaches 10, show a full-screen congratulations overlay with a Restart button.
4. Navigation
   - A Quit button returns the user to the start menu and resets progress state.
5. Admin Page (Calibration)
   - Accessible at /admin.html.
   - Live AR view with the same 10 markers.
   - When a marker is detected, allow adjusting overlay parameters: overlay image, width, height, position offset (x,y,z), rotation offset (x,y,z).
   - Load an existing config.json from disk and apply it.
   - Download the current configuration as config.json; creators then place it at assets/config.json and commit.
   - Main app reads assets/config.json at runtime and applies per-marker settings so overlays look flush/real in the room.

## Non-Functional Requirements
- Platform/Browser
  - iOS Safari (iOS 15+) and Android Chrome (90+).
  - Desktop browsers may load but not guaranteed for AR camera constraints.
- Performance
  - Detection at interactive rates under typical indoor lighting on mid-range phones (<= ~150ms/frame target where possible).
  - Keep total page weight small (prefer CDN for libraries; lightweight images).
- Privacy/Security
  - Camera access only; no data stored or transmitted beyond assets delivery.
  - Served over HTTPS (required for getUserMedia on iOS/Android).
- Accessibility
  - Large, finger-friendly tap targets; readable text; adequate contrast.
- Responsiveness
  - Mobile-first layout that adapts to common phone aspect ratios.

## Technical Approach & Constraints
- Library choice (v1): A-Frame + AR.js (pattern markers) via CDN.
  - Rationale: Reliable detection with simple, printable markers; robust on iOS Safari and Android Chrome; minimal setup; no install.
  - Each symbol corresponds to a .patt marker file generated from a simple shape graphic.
- Alternative (future option): mind-ar-js for natural image targets (requires texture-rich images; simple geometric shapes are low-feature and may track poorly). For this project, we also provide a MindAR-based flow for detecting existing room pictures.
- Anchoring: Use marker coordinate space to place a 2D plane (a-plane) textured with the overlay image; rotate so it appears as a “picture” on the wall. For MindAR, align the plane to the detected image target.
- Hosting: GitHub Pages (HTTPS by default). All assets under the same repo.
- No build tooling required initially; pure static site.

## Assets
- 10 marker pattern files: assets/patterns/{triangle|square|rectangle|circle|star|pentagon|hexagon|diamond|heart|arrow}.patt
- 10 overlay images (SVG/PNG): assets/overlays/{shape}.svg; plus 10 sample picture overlays under assets/overlays/samples/sample-01..10.svg
- Natural-image targets (MindAR): captured photos in assets/targets/captures/; compiled targets file at assets/targets/compiled/targets.mind
- Optional: Printable marker sheets (PNG/PDF) for each symbol under assets/markers/ for easy placement on walls.

## Browser/Device Support Matrix (target)
- iOS Safari 15+: Supported.
- Android Chrome 90+: Supported.
- Other modern mobile browsers based on WebKit/Blink: Likely, but not guaranteed.

## Acceptance Criteria
- Starting from the root URL, user sees a fun, themed start menu with instructions and a Start button.
- Tapping Start requests camera permission and opens the rear camera.
- Symbols, when presented (printed markers), are detected within ~1–2 seconds in normal indoor lighting.
- On first detection of each symbol:
  - A visible highlight occurs.
  - A flat image overlay appears firmly attached/oriented relative to the symbol.
  - HUD increments to reflect found count.
- After finding all 10 symbols, a full-screen congratulations overlay appears with a Restart option.
- Quit button returns to the start menu and resets the state.
- Page loads and functions on iOS Safari and Android Chrome served via HTTPS.
- Admin: /admin.html loads on mobile, detects markers, allows interactive tuning of overlay width/height/offset/rotation, can load a JSON config, and can download an updated config.json that the main app consumes.

## Risks & Mitigations
- Simple shapes have low feature density for natural image tracking → Use AR.js pattern markers (black border + internal pattern) for robust detection.
- Lighting variability → Recommend high-contrast printed markers; test under indoor ambient and mixed lighting; avoid glossy reflections.
- Mobile OS/browser constraints on camera access → Serve over HTTPS (GitHub Pages), and test on-device.
- Performance on low-end devices → Keep overlays lightweight; avoid heavy scripts; prefer CDN; limit DOM updates.

## Deployment
- GitHub Pages serving from main branch root.
- All assets in-repo under /assets; no external storage required.

## Out of Scope
- Authentication, accounts, scores, persistence, analytics.
- Complex 3D models or physics.

## Installation & Usage (High-Level)
- Open the published GitHub Pages URL on your phone.
- Grant camera permission when prompted.
- Place/print the 10 markers around the room; scan to find them all.


