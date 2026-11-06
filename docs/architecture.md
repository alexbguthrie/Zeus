# Zeus code map

Organize by feature inside the UI, and by desktop responsibility inside Electron.
Each component should describe a visible part of Zeus. Hooks hold its state and effects.

## Where to make a change

| Change                              | Start here                                       |
| ----------------------------------- | ------------------------------------------------ |
| Overall launcher layout             | `src/renderer/launcher/Launcher.tsx`             |
| Search field                        | `src/renderer/launcher/SearchBar.tsx`            |
| Search matching                     | `src/renderer/launcher/search.ts`                |
| Section names and order             | `src/renderer/launcher/sections.ts`              |
| Keyboard controls                   | `src/renderer/launcher/useLauncherKeyboard.ts`   |
| Launcher UI state and actions       | `src/renderer/launcher/useLauncher.ts`           |
| Native layout handshake             | `src/renderer/launcher/useLauncherWindow.ts`     |
| Pinned workspace and two-card limit | `src/renderer/pinned/PinnedWorkspace.tsx`        |
| Notes, timer, or calculator         | The matching folder under `src/renderer/pinned/` |
| Appearance settings                 | `src/renderer/settings/`                         |
| Colors and global styles            | `src/renderer/styles/`                           |
| Sample chat app                     | `src/renderer/applications/mock-ai/`             |
| Image resizer                       | `src/renderer/tools/resize-image/`               |
| Native window transitions           | `src/main/launcher-window.ts`                    |
| Tray menu and global shortcut       | `src/main/tray.ts`                               |
| Native application/tool windows     | `src/main/app-windows.ts`                        |
| Native image save dialog            | `src/main/image-save.ts`                         |
| IPC authorization and validation    | `src/main/ipc.ts`                                |
| Saved native appearance             | `src/main/preferences.ts`                        |
| Regression checks                   | `tests/main/` and `tests/renderer/`              |

## How the pieces connect

`src/main/index.ts` starts Electron, loads preferences, creates the launcher window,
registers IPC, and creates the tray. It delegates the behavior to the files above.

The renderer runs without Node.js access. The three scripts in `src/preload/` expose
specific operations: launcher controls, read-only application appearance, and image
saving. Their contracts live in `src/shared/`. IPC uses `zeus:` channels and verifies
the sending window before carrying out native operations. Application IDs map to
fixed native pages; renderer input never supplies a file path.

`src/renderer/main.tsx` initializes appearance and mounts the launcher.
`Launcher.tsx` assembles the visible pieces. `useLauncher` owns the UI transitions;
keyboard handling, result matching, and the native layout handshake have separate files.

`PinnedWorkspace` keeps the notes, timer, and calculator hooks mounted even when a
card is tucked away or the launcher is hidden. This preserves notes, calculations,
and a running timer while switching views.

## Styling and builds

Global defaults and theme tokens live in `renderer/styles/`. Feature styles stay
beside their components. Run `npm run format` after editing; `npm run check` also
checks formatting.

`vitest.config.ts` runs the native-boundary tests in Node and the React recovery
tests in JSDOM. `npm run check` includes these tests, so GitHub Actions runs them
with the production build. Failure-injection tests cover rejected IPC requests,
stale responses, app launch errors, retries, and keeping pinned notes mounted.

`electron.vite.config.ts` builds Electron and the three CommonJS preloads.
`vite.renderer.config.ts` supplies the same renderer configuration to Electron and
the standalone browser preview. It builds the launcher, Zeus AI, and Resize Image
as separate HTML entry points and copies `renderer/assets/` into the renderer output.
Generated files belong in `out/` and are ignored by Git.

## Compatibility

The old `Zeus Toolbelt Beta` data directory, `beta-preferences.json`, and local-storage
keys are intentionally retained. These are persistence identifiers, not feature names.
Do not rename them without migrating existing data. Electron's `--user-data-dir` switch
can select a separate profile for checks without touching personal notes or preferences.

Native state changes carry a revision. The renderer prepares its layout before the
native window is revealed; stale acknowledgements cannot resize a newer session.
Preserve that sequence when changing window behavior.
