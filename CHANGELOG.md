# 0.2.0 — Interface and touch revision

- Bundle the full interface and game into `index.html`, preventing the unstyled layout caused by a missing separate stylesheet.
- Keep editable source files and a dependency-free Node bundler for future development.
- Add joystick dead zone, normalized camera response, two-thumb handling, and release/reset behavior when opening overlays or backgrounding.
- Add camera sensitivity, joystick response, vertical inversion, walking motion toggle, and camera leveling in Settings. Older saves receive defaults.
- Add single-tap item selection followed by the interaction button, while retaining triple-tap inspection.
- Replace flattened inspection rotation with extruded placeholder geometry. Add tilt, flip, reset, and zoom buttons.
- Prevent pinch and vertical-drag gestures from counting as close taps.
- Keep the current exchange visible beside the notebook in landscape and above it in portrait. Fit conversations to a reduced visual viewport when the keyboard opens.
- Use a self-contained page for offline caching, check navigation online, and offer an explicit save/update action when a worker is waiting.
- Keep schema-1 saves, the sample world, and the tentative A/B treatments.

Full Life Engine integration, vampire mechanics, and a representative final art comparison remain future work.
