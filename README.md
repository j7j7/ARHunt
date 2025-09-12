# ARHunt

ARHunt is a browser-based, mobile-friendly AR “treasure hunt.” Using your phone’s camera, it detects symbols around a room and overlays a flat “picture” on the wall at each symbol’s location. No app install required.

- Mobile web: iOS Safari (15+) and Android Chrome (90+)
- Fast to set up: static site, CDN libraries
- Two modes: marker-based (AR.js) and natural-image (MindAR)

## Live (GitHub Pages)
If GitHub Pages is enabled for this repo, open:
- Main (marker-based): https://j7j7.github.io/ARHunt/
- Admin (marker-based): https://j7j7.github.io/ARHunt/admin.html
- MindAR hunt (natural-image): https://j7j7.github.io/ARHunt/mind-hunt.html
- Admin (natural-image): https://j7j7.github.io/ARHunt/admin-natural.html
- MindAR quick-start example: https://j7j7.github.io/ARHunt/mindar.html

## How to play (marker-based)
1) Open the main app URL and tap Start. Grant camera permission.
2) Present a printed AR.js pattern marker (e.g., triangle, hexagon). When detected, a “picture” appears aligned to the wall.
3) The HUD shows “Found X/10”. Find all to see the congratulations screen.

## Admin (marker-based)
Use this when you want to place your own overlays on printed symbols.
1) Generate AR.js markers and pattern files:
   - Use the AR.js Marker Generator to create a marker image (print this) and a matching .patt file.
   - Save .patt files in assets/patterns/ (e.g., triangle.patt), and print the generated marker sheets.
2) Open /admin.html on your phone.
3) Show a printed marker to the camera; pick the marker ID, choose an overlay, and tweak width/height/position/rotation.
4) Download config.json and place it at assets/config.json. Commit and push.

Tips:
- Set <a-marker size> to match your printed marker (e.g., size="0.09" for 9 cm) for correct scaling.
- Use good lighting and matte paper; avoid glare.

## How to play (natural-image / MindAR)
1) Compile your target images into assets/targets/compiled/targets.mind via MindAR CLI/Studio.
2) Open /mind-hunt.html and tap Start. When a prepared picture (target) is detected, the overlay appears.

## Admin (natural-image)
1) Open /admin-natural.html. Optionally capture a picture of the real object, then compile to a .mind file.
2) Place targets.mind at assets/targets/compiled/targets.mind and commit.
3) In /admin-natural.html, select a target index 0..9, choose an overlay, and adjust size/offset/rotation.
4) Download natural-config.json and merge the naturalTargets section into assets/config.json. Commit and push.

## Local development
- Static site; any static server works. Example: `npx http-server`.
- iOS Safari requires HTTPS for camera; easier to test via GitHub Pages.

## Troubleshooting
- Can’t tap “Allow”: use HTTPS (GitHub Pages). We disabled in-app overlays to prevent blocking.
- Marker not detected: print AR.js marker (with black border), not the overlay SVG. Ensure the matching .patt file exists at assets/patterns/ and the path matches.
- Overlay appears away from marker: ensure printed marker and .patt were generated together; set correct marker size; use smoothing if desired.
- Overlay not visible in admin: increase position.y (e.g., 0.02), and try a bold overlay; verify overlay file path.

## Credits
- A-Frame (https://aframe.io)
- AR.js (https://ar-js-org.github.io/AR.js-Docs/)
- MindAR (https://hiukim.github.io/mind-ar-js-doc/)

