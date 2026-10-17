# MARK OF HAEMATHA — First Summer

**Build 0.2.3 · camera-height and vertical-look revision · compatible with previous schema-1 saves.**

The standing camera now meets the sample NPCs at eye level. Crouching physically lowers the viewpoint with a short transition, and the crouch button changes to **STAND** until you rise. Standing/crouching changes height independently from looking up or down. Buildings use the same revised height reference.

Vertical look now reaches approximately 55 degrees up and down, with its own **Vertical look** slider in Map → Settings. Horizontal sensitivity and swipe response are preserved. The **Level camera** button resets the look angle. Floor-level objects may require looking down from the corrected standing height.

The prototype still uses a raycast renderer: vertical look shifts its projection horizon, rather than rotating a complete polygonal 3D world. The height correction and range are functional improvements; final full-3D presentation remains undecided.

To equip a weapon, take it and place it in your backpack or a pocket. Inventory selects the newly collected item; press **Equip** there. The equipment display and item outline identify what is ready, and the Attack button changes to that weapon. **Unequip** returns to fists. Inspection no longer offers an Equip action for an item still on the ground.

The right-hand action buttons form an upward-tilted diamond: the large Attack button is on its left, the large Interact button at its upper right, with smaller Jump and Duck buttons at the remaining corners. The arrangement is used in landscape and portrait.

The map now opens a separate opaque full-screen view. The top-left map button stays available: press it again to return to play. Inventory, Workshop, Saves, and Settings remain tabs on that screen. The world pauses while the map/menu screen is open. The M key toggles it on PC; the Return button remains an alternative.

The playable page now includes its styles and scripts. A missing separate `style.css` upload no longer breaks the control layout. This revision improves the joystick, simultaneous move/look input, camera settings, object inspection, and the notebook/conversation layout. It keeps the initial sample world and both tentative visual treatments.

A first-person investigation slice for phone, tablet, and PC. Start at the print works after a coworker misses a shift. Explore Ash Street, question people, inspect the blood and the letter, visit your sister, and experiment at the library workbench.

This is a working interface and simulation foundation, not the full game. It has no external runtime dependencies, accounts, server, API key, or telemetry. A prebuilt `index.html` is included; no build step is required to upload or play.

## Put it on GitHub Pages

1. Extract `mark-of-haematha-v0.2.3-pwa.zip`.
2. Upload the **contents of the `mark-of-haematha-v0.2.3` folder** to the existing repository root, replacing the previous build's matching files. For playing/installing, the required upload is `index.html`, `sw.js`, `manifest.webmanifest`, and the `icons` directory. All other files are editable sources, documentation, or developer tests. Uploading the ZIP alone will not run the game.
3. In the repository, open **Settings → Pages**. Under deployment, choose **Deploy from a branch**, then your `main` branch and **/(root)**. Save.
4. Open the Pages address GitHub provides once deployment finishes. Repository subpaths are supported; no source edits are needed.
5. On iPhone, open that address in Safari, use **Share → Add to Home Screen**, then launch the icon. Let the first online load finish before testing offline. Landscape is recommended; iOS may not enforce the manifest's landscape preference.

If uploading folders from an iPhone is awkward, use your preferred GitHub editor or development environment to unpack the ZIP into the repository, rather than trying to run it from the Files app. All source files are plain text. Pages needs HTTPS; opening `index.html` directly cannot install the PWA or cache it offline.

When replacing build 0.1, wait for Pages deployment to finish, close every open game tab and Home Screen game window, then reopen online. The startup page and Settings identify **0.2.3**. Existing saves use the same storage key and schema; export a backup from the old build before updating if you have progress worth keeping. No deletion of website data is required.

For later updates, an available **Save & update** button activates a waiting build. Opening the game online also checks the page for a newer version. A build already controlled by the old 0.1 worker may need the one-time close/reopen described above.

## What works

- Lightweight first-person exploration with collision, a joystick dead zone, simultaneous two-thumb move/look, jump, and crouch. Settings include look sensitivity, joystick response, inverted vertical look, camera leveling, and optional walking motion.
- A fixed print works, street, home, and library/workshop in a fictional test town.
- Five named NPCs with sample histories, relationship scores, local conversation rules, and limited schedules. Ask naturally about Thomas, blood, the library, your sister, or help. Only the current exchange is shown.
- Fullscreen object inspection with extruded placeholder models that turn and tilt, flip/reset buttons, pinch/scroll/button zoom, take/equip/use actions, and clues you can read. A single tap selects an object for the interaction button; triple-tap inspection remains available.
- Ten-cell shaped backpack and four pockets, with manual placement, relocation, dropping, and pocket-size restrictions.
- Personal notes and a self-authored checklist. Opening the notebook pauses the world and preserves the current conversation.
- Date/time, fatigue, rest, bed recovery, map travel by foot or by motorcar if you find its keys, and observation time acceleration.
- One improvisable workshop recipe. Valid components start construction; in-world time completes it; successful completion records the blueprint and its faster future construction time.
- Twelve manual save slots, five independent rolling autosaves, resume, save import/export, and offline app-shell caching.
- A/B treatment toggle in Map → Settings. Compare flat angular figures with softened shading and facade detail in the same scene.

## Prototype limits — important

The world uses a **Canvas raycast renderer with billboard figures and objects**. It lets us test navigation and control layout with a small download. The inspection viewer now uses simple extruded models, projected in software, with approximate face detail. These are functional placeholders rather than final object assets. The A/B toggle tests atmosphere and readability; it is **not** a reliable performance or art-quality comparison of the previously discussed final A/B styles. Final visual direction remains undecided.

NPCs use authored sample data and intent rules. They do **not** use the Life Engine or live generative conversation yet. Broadly phrased questions work within the supported topics, but arbitrary requests may receive a clarification. No generated population, player-state selection, evolving town-wide infection, vampire combat/capture, final story outcomes, full ancestry, opening movie, audio, or worldwide travel is implemented here. Sister symptoms are sample dialogue, not a completed Hunger simulation. No canon for the Founders or rune designs is replaced by this build. The app icon is a temporary H monogram.

The workshop accepts supported recipes; it does not reason about arbitrary inventions. Observation currently slows for nearby NPCs in view, including people already present, rather than detecting every doorway event. Rest and NPC schedules are simplified. No hostile NPC is active, so rest cannot yet be attacked. Attack and jump inputs are present for feel testing; attack does not injure the test NPCs. There is no game-ending clock or death in this slice.

## Controls

| Action | Touch | Keyboard / mouse |
|---|---|---|
| Move | Left joystick | WASD; Up/Down |
| Look | Drag the scene | Drag mouse; Left/Right arrows turn |
| Talk | Tap a nearby person | Aim, then E |
| Interact | Right ◇ button | E |
| Inspect | Triple tap, or tap item then ◇ | Aim, then F or E |
| Turn / tilt / zoom inspected item | Drag / pinch or +/− | Drag / scroll or +/− |
| Flip / reset inspected item | FLIP / RESET VIEW | Same buttons |
| Exit inspection or conversation | Triple tap blank area, or close button | Escape |
| Attack | ✦ button | X |
| Jump | ↑ button | Space |
| Crouch | ⌄ button | C |
| Observe | Hold ⌄, choose duration | O |
| Stop observing | Tap ⌄, or move | Move; crouch button |
| Rest | ☾ beside fatigue | R |
| Town map / menus | Top-left ◎ | M |
| Backpack | ▣ beneath map | I |
| Notebook | Top-right ▤ | N |

The game pauses in menus, inventory, inspection, the notebook, or while the app is backgrounded. Conversation uses live world time. This inspection/menu pause behavior is a prototype convenience and remains an implementation decision to review. Travel and rest simulate time rather than waiting the full duration. Fatigue reaching zero triggers eight hours of sleep.

## First test session

Try exploring without using the map first. Find Thomas's locker area and the folded letter. Ask Arthur what he saw last night, then ask Edith why Thomas's absence worries her. Open the notebook during a conversation and confirm the current exchange is still visible. Inspect an object and place it in a specific pocket or backpack location.

Then use the map to visit the library. Cloth, a wooden handle, and wire form the prototype's one supported assembly. In the Workshop tab, select those exact three parts. A first improvised attempt takes 55 in-world minutes. Leave the bench and let time pass, observe, travel, or rest. Once complete, the Library keeps the blueprint; future builds take 20 minutes. This recipe is an interface test, not a medical model.

Finally, save a named slot, change something, and load it. Export an additional backup. Try the A/B toggle from the same camera position and compare control sizes in landscape and portrait.

## Saves and updates

Browser storage is local to the exact site origin and this app's storage key. It is not synchronized across devices. Private browsing, cleared site data, storage eviction, or moving to another host can remove access to saves. Export important worlds to JSON. Import checks the build schema and basic state validity.

A save restores the player, time, NPC positions, clue flags, notes/tasks, relationships, objects, inventory, and workshop work. Autosaves happen on arrival, collection, notebook close, construction start, approximately every 90 active seconds, and when the app backgrounds. There is no autosave before every action.

For an app update, change the version suffix of `CACHE` in `sw.js`, rebuild `index.html` if the sources changed, and upload the files together. Caches are scoped to this installation path. The service worker uses online navigation when available and a cached page offline. Required offline caching depends only on the self-contained page; missing development files cannot prevent it. Do not delete user save data just to refresh the app cache.

## Local development

Serve this folder over localhost, for example:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. No package installation is required to play. A phone cannot reach another computer through `localhost`; use the HTTPS Pages address for the simplest device test.

For source edits, modify `index.template.html`, `style.css`, `touch.css`, `app.js`, or `controls.js`, then run `node build.cjs`. It generates the upload-ready `index.html` using only Node's standard library. Editing an external style/script file without rebuilding will not change the bundled game.

For the optional automated checks, install Playwright outside the game or in a development checkout and install its Chromium browser:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/smoke.cjs
node tests/refinements.cjs
node tests/camera.cjs
```

The script starts a local server itself. Set `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, or `TEST_PORT` if your test environment needs custom locations. These are test dependencies only and do not need uploading to Pages. Do not upload `node_modules`.

## Files and next integration points

- `index.html`: self-contained prebuilt playable page.
- `index.template.html`, `style.css`, `touch.css`, `build.cjs`: interface sources and bundler.
- `app.js`: local world state, simulation clock, NPC sample schedules and conversations, raycast scene, inventory, workshop, saves. `window.Haematha` exposes a small diagnostic interface for tests and future integration.
- `controls.js`: input refinements, viewport handling, inspection projection, and update prompt.
- `sw.js`, `manifest.webmanifest`, `icons/`: install/offline shell.
- `tests/smoke.cjs`: browser interaction, state restoration, packing, recipe, and offline checks.
- `tests/refinements.cjs`: missing-upload regression, two-thumb input, inspection gestures, control settings, legacy saves, and conversation layout.
- `tests/camera.cjs`: eye-level projection, physical crouch height, stand feedback, look range, independent sensitivities, inversion, portrait behavior, and saved crouch state.
- `TEST-REPORT.md`: validation performed for this build.

Next engineering milestones are separating the simulation from rendering, connecting Life Engine history and schedules, adding Thrall/Hunger state progression and Maker relationships, replacing the sample renderer for a true A/B scene comparison if desired, and implementing hostile encounter behavior. Keep generated worlds and immutable lore in separate data modules as those systems arrive.
