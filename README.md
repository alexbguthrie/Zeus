# Zeus

A desktop launcher built with Electron, React, TypeScript, and Vite.

## Run

Use Node.js 26 (`nvm use`), then:

```sh
npm ci
npm run dev
```

Zeus starts hidden in the menu bar. Press **Command+/** (Control+/ on Windows/Linux)
or choose **Show Zeus** from the tray. Quit older Zeus instances if they hold the shortcut.

## Find your way around

```text
src/
  main/          Native windows, tray, IPC, and preferences
  preload/       Narrow bridges between native code and the UI
  shared/        Launcher, appearance, and image-save types
  renderer/
    launcher/    Search bar, section picker, results, and keyboard behavior
    pinned/      Workspace layout, controls, and presentation variants
    settings/    Appearance settings and theme preferences
    applications/  Zeus AI sample app
    tools/       Notes, Timer, Calculator, Resize Image, and the tool registry
    styles/      Global base styles and theme tokens
    assets/      Tray artwork
```

Start with [the code map](docs/architecture.md) for the files to edit for each feature.
Feature components and styles live together. `src/renderer/main.tsx` is the UI entry;
`src/main/index.ts` starts Electron.

See [Working on Zeus](CONTRIBUTING.md) for naming, types, feature organization,
styles, and the checks to run before sharing a change.

## VS Code

Open the Zeus folder itself in VS Code. The shared `.vscode/settings.json` hides
`node_modules/`, `out/`, `dist/`, `release/`, TypeScript build cache files, and
`.DS_Store` from the Explorer. Files stay on disk and remain available to the build
and terminal. Set a matching `files.exclude` entry to `false` to show it again.

Install **Prettier - Code formatter** (`esbenp.prettier-vscode`), recommended through
`.vscode/extensions.json`. Save a file with Command+S (Control+S on Windows/Linux)
to format it using the project's local Prettier dependency, `.prettierrc.json`, and
`.prettierignore`. These editor settings apply to Zeus; other projects retain their
own settings. Syntax errors must be fixed before Prettier can format a file.

## Commands

```sh
npm run dev:browser  # Browser preview at http://127.0.0.1:5173
npm run format       # Apply the project's formatting rules
npm test             # Run the automated regression tests
npm run check        # Check TypeScript, formatting, and regression tests
npm run build        # Check and compile into out/
npm start            # Open the compiled app after building
```

The Electron dev command reloads native changes and hot-updates React. GitHub Actions
runs the same build checks. Installer packaging, signing, and auto-updates are not configured.

Regression tests live in `tests/main/` and `tests/renderer/`. They cover tray asset
paths, app launch failures, and native window recovery, including retry behavior and
preserving pinned notes. These tests run without opening Electron or touching personal data.

## Pinned design previews

Run `npm run dev:browser` and open
[the pinned gallery](http://127.0.0.1:5173/previews/pinned/) to compare three compact,
icon-only layouts. Click tool icons to open or tuck away a tool, and use the theme
switch to check both appearances. Preview notes use separate storage keys.

Choose a saved layout in **Settings… → Pinned layout**. Slim bar is the default;
Micro dock and Side rail remain available. See [the design notes](docs/design/pinned.md).

## Use the launcher

- Pause with an empty search, or press Down, to explore sections.
- Use Left/Right and Enter, or Command/Control+1–5, to open sections.
- Search **Zeus AI** or **Resize Image** to open their windows.
- Press Up from an empty search to pin Notes, Timer, and Calculator.
- Escape backs out and then hides the launcher. The unpinned launcher hides on blur.
- Open **Settings…** from the tray for Light, Dark, and System appearance, and your pinned layout.
- Browser settings are available at `/?view=settings`.

Files, Actions, and Clipboard contain sample data. Zeus AI uses local mock replies.
The timer continues while tucked away or hidden, but resets when the app quits and has no alarm.

The launcher came from `/Users/abg/Backups/Zeus/Zeus-v0.03/beta/`. Its existing storage
identifiers remain intact so saved notes and preferences survive the reorganization.

Repository: [alexbguthrie/Zeus](https://github.com/alexbguthrie/Zeus).
