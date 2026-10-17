# Build 0.2.1 verification

Date: 2026-10-17

## Automated result

**73 checks passed: 52 base/map checks and 21 touch revision checks. No browser runtime errors recorded.**

Map checks cover a full-viewport opaque screen in landscape and portrait, hidden world/movement controls, paused world time, the same map button returning to play, unchanged player position, M-key toggle, return from other menu tabs, and inventory inspection above the navigation screen. The landscape map screen was visually inspected.

The included `tests/smoke.cjs` ran against a real headless Chromium browser, with an 852 × 393 mobile/touch-emulated viewport and a 393 × 852 portrait viewport. The app was served under `/test-repository/` to exercise GitHub Pages-style repository subpaths.

The additional `tests/refinements.cjs` ran under `/revision/` with separate `style.css`, `touch.css`, `app.js`, and `controls.js` requests deliberately returning 404. The self-contained game still rendered its interface and resumed offline. Two simultaneous touch contacts were dispatched through the browser's touch-input API. Keyboard layout was checked using a simulated reduction of Visual Viewport height; this is not a physical iOS keyboard test.

Revision checks verified joystick dead zone, simultaneous move/look, stopping on release, stored control preferences, camera leveling, old-save control defaults, inspection flip/tilt/reset, repeated pinches without accidental close, deliberate triple-tap close, tap-then-interact inspection, nonoverlapping notebook and current exchange in both orientations, keyboard-reduced conversation bounds, and styled offline resume with separate source files unavailable.

Verified:

- Start, keyboard movement, captured-pointer joystick movement.
- Live NPC interaction, typed dialogue, alternate question phrasing, distinct NPC knowledge.
- Current conversation preserved while opening the paused notebook.
- User notes, a manually created task, and paused world time.
- Triple-tapping a world object to open inspection; reading the letter.
- Pocket placement, shaped backpack placement, edge-overflow rejection, equipment selection, and world-object removal after pickup.
- Manual save creation, complete time/notebook restoration, five rolling autosaves, and preservation of manual slots.
- Map travel that changes location and advances time.
- Correct recipe component consumption, slower undiscovered construction, output on elapsed time, and blueprint discovery.
- Rest advances the selected hour; observation advances time and can be canceled.
- A/B treatment stored in world state.
- Save validation rejects an out-of-world player.
- Actual network-offline page reload, offline shell availability, and resuming stored progress.
- Relative PWA manifest paths, portrait inventory visibility, and absence of document-width overflow.

JavaScript syntax checks passed for `app.js`, `controls.js`, `build.cjs`, and `sw.js`. The generated page has embedded styles and scripts. Front and back inspection views and notebook/conversation layout were visually inspected. QA screenshots are internal and are not included in the release archive. The distribution ZIP was checked for archive integrity and required files.

## Device testing still required

A physical iPhone/iPad, iOS Safari installation, Home Screen launch, real multi-touch/pinch, mobile keyboard ergonomics, battery/thermal performance, Safari save downloads, and long-session storage behavior were not tested here. Chromium touch emulation is not a replacement for those checks. No final frame-rate claim is made.

This validates the prototype's implemented slice, not future Life Engine, combat, Hunger, procedural-world, or final story systems. The A/B toggle is an early readability/atmosphere aid; full 3D style performance remains untested.
