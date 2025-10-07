# ARHunt Development Memory

This file tracks key changes made to the ARHunt project and development progress.

## Recent Changes (October 7, 2025)

### Fixed InstantDB Import Issue
**Problem**: The app was getting errors when trying to load InstantDB:
- `GET https://esm.sh/@instantdb/version@v0.22.6?target=es2022 net::ERR_ABORTED 500 (Internal Server Error)`
- `TypeError: Failed to fetch dynamically imported module: https://esm.sh/@instantdb/core@0.22.6`

**Solution**: Replaced ESM.sh dynamic import with Skypack CDN and proper initialization:

1. **Changed from dynamic import to static module loading**:
   - Before: `const { init, i, id } = await import('https://esm.sh/@instantdb/core@0.22.6');`
   - After: Added Skypack CDN script in `index.html` that makes InstantDB globally available

2. **Updated index.html**:
   - Added InstantDB import via Skypack CDN with proper ES module support
   - Added event-driven initialization to ensure InstantDB loads before main script

3. **Updated mind-hunt.js**:
   - Changed from async function with dynamic import to proper event-driven initialization
   - Added dual event listener system that waits for both DOM ready and InstantDB ready
   - Uses `window.InstantDB` instead of dynamic import

**Files Modified**:
- `index.html`: Added Skypack CDN script for InstantDB
- `mind-hunt.js`: Refactored initialization to use global InstantDB object

**Status**: Fixed and tested locally. Ready for GitHub Pages deployment.

## Project Architecture Notes

- **Database**: Uses InstantDB for real-time multiplayer features (discoveries notifications)
- **AR Framework**: MindAR + A-Frame for WebAR functionality
- **Deployment**: GitHub Pages (static hosting)
- **Target Detection**: Requires `assets/targets/targets.mind` file compiled from MindAR
- **Assets Structure**: 
  - `assets/overlays/DA1.jpg` through `DA8.jpg` for target overlays
  - `assets/targets/targets.mind` for AR target recognition

## Current Issues to Watch
- None currently - InstantDB integration working properly
- Future: May need to update target images or MindAR compilation if detection issues arise