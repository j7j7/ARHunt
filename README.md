# ARHunt

ARHunt is a browser-based, mobile-friendly AR "treasure hunt." Using your phone's camera, it detects prepared picture frames in a room and overlays digital content when each target is found. No app install required.

- Mobile web: iOS Safari (15+) and Android Chrome (90+)
- Natural image detection using MindAR
- 5-second countdown before completion celebration

## Live (GitHub Pages)
Main app: https://j7j7.github.io/ARHunt/

## How to play
1. Open the main app URL and tap Start. Grant camera permission.
2. Move your phone around the room to scan for prepared picture frames (targets).
3. When a target is detected, a description appears at the bottom of the screen.
4. Find all 8 targets to trigger a 5-second countdown.
5. After the countdown, view your completion QR code for your record.

## Features
- 8 target images to discover
- Large, centered target descriptions with drop shadows for readability
- Multi-colored globe fireworks explosion on each discovery
- Animated 5-second countdown at top of screen before completion
- QR code generation with timestamp and unique identifier
- Video feed stops when showing completion screen

## Local development
- Static site; any static server works. Example: `npx http-server`.
- iOS Safari requires HTTPS for camera; easier to test via GitHub Pages.

## Setup Requirements
- Target images must be compiled into `assets/targets/targets.mind` using MindAR CLI/Studio
- Place overlay images in `assets/overlays/` directory
- Ensure proper lighting and clear target images for best detection

## Project Structure
```
ARHunt/
├── index.html              # Main application
├── mind-hunt.js            # Game logic and AR functionality
├── styles.css              # All styling and animations
├── assets/
│   ├── targets/
│   │   └── targets.mind    # MindAR compiled target file
│   └── overlays/
│       ├── DA1.jpg         # Target overlay images
│       ├── DA2.jpg
│       └── ... (DA3-DA8)
└── README.md
```

## Credits
- A-Frame (https://aframe.io)
- AR.js (https://ar-js-org.github.io/AR.js-Docs/)
- MindAR (https://hiukim.github.io/mind-ar-js-doc/)

