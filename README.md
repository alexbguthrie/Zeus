# Zeus

Desktop app built with Electron, React, TypeScript, and Vite via electron-vite.

## Development

Use Node.js 26 (`nvm use` if you use nvm), then:

```sh
npm ci
npm run dev
```

The dev command starts Electron and Vite, with hot updates for React and reloads for main/preload changes.

```sh
npm run dev:browser # Renderer preview without Electron
npm run check       # TypeScript checks for all processes and configs
npm run build       # Type-check and compile into out/
npm start           # Open the compiled desktop app after building
```

`npm run build` produces application files; installer packaging, signing, and auto-updates are not configured yet.

## Structure

- `src/main/`: Electron app lifecycle and native windows.
- `src/preload/`: Sandboxed launcher, appearance, and image-save bridges.
- `src/renderer/src/`: Restored launcher, settings, and appearance handling.
- `src/renderer/tools/`: Pinned Notes, Timer, Calculator, and the Resize Image window.
- `src/renderer/applications/`: Zeus AI sample app.
- `src/shared/`: Typed lifecycle and preload contracts.
- `src/renderer/styles/`: Existing Zeus styles and light/dark theme tokens.
- `docs/`: Project notes.
- `scripts/`: Project scripts.

The renderer has context isolation and sandboxing enabled, with Node.js access disabled. Add narrowly scoped preload methods when native functionality is needed.

## Launcher

The native app starts hidden and adds a Zeus tray/menu bar icon. Press **Command+/ (Control+/ on Windows/Linux)** or choose **Show Zeus** from the tray. Quit older Zeus versions if they are holding that shortcut.

- Pause with an empty search or press Down to explore Apps, Tools, Files, Actions, and Clipboard.
- Use Left/Right and Enter, or Command/Control+1–5, to open sections.
- Search **Zeus AI** or **Resize Image** and press Enter to open their windows.
- Press Up from empty search to pin the Notes, Timer, and Calculator hub.
- Escape backs out and then hides the launcher; the unpinned launcher also hides on blur.
- Open **Settings…** from the tray for Light, Dark, and System appearance.

The browser preview opens the launcher directly. Visit `/?view=settings` for browser appearance settings. Native notes and preferences retain the backup's `Zeus Toolbelt Beta` storage directory and existing local-storage keys. Passing Electron's `--user-data-dir` switch allows an isolated profile.

Files, Actions, and Clipboard retain the backup's sample data. Zeus AI is a local mock chat, with no API connection. The Chrome extension prototype is outside this launcher migration.

## Appearance

`styles.css` and `theme.css` were copied unchanged from `/Users/abg/Backups/Zeus/Zeus-v0.03/beta/src/renderer/`. This is the backup containing the launcher in `Launcher.tsx`; the top-level `src/renderer/` contains an older initial interface. The restored launcher uses their existing classes. Light, dark, and system modes are supported, with the previous preference key retained. The launcher UI, native hidden/launcher/pinned/settings lifecycle, tray, preloads, pinned tools, and its Zeus AI and Resize Image windows are restored from the same backup.

## GitHub

Repository: [alexbguthrie/Zeus](https://github.com/alexbguthrie/Zeus).

GitHub Actions installs locked dependencies and runs the production build on pushes to `main` and pull requests.
