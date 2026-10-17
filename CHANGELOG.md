# 0.2.3 — Camera height and vertical look

- Raise the standing viewpoint from the NPCs' midsection to their eye level.
- Give crouching a physical height reduction with a short transition, instead of an offset of the horizon. Label the crouch button STAND while lowered.
- Match walls, NPCs, and objects to the revised eye-height projection.
- Expand vertical look to approximately 55 degrees each way and add independent vertical sensitivity.
- Preserve horizontal look response and saved controls. Older saves receive the vertical default.
- Keep off-screen floor items from being targeted solely by horizontal alignment.

# 0.2.2 — Equipment and action buttons

- Move equipping into Inventory, removing the misleading inspection action for uncollected weapons.
- Select an item after it is collected so its inventory actions are immediately available.
- Show a current-equipment display, equipped-item outline, explicit Equip/Unequip state, and the selected weapon on the Attack button.
- Autosave equipment changes; dropping the equipped weapon restores fists.
- Place Attack on the left of an upward-tilted diamond on the right side of the screen, with Interact upper right and smaller Jump/Duck buttons at the other corners.
- Keep the separate map screen and existing schema-1 saves.

# 0.2.1 — Map screen

- Open the map and its menu tabs on their own opaque full-screen view.
- Hide the scene and movement controls while the map is open.
- Keep the same top-left map button available to return to play from any menu tab.
- Make the M key toggle the map on PC.
- Preserve player position, camera, and existing saves. Rest and observation prompts keep their existing dialog layout.

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
