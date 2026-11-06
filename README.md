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
- `src/preload/`: Sandboxed bridge exposing runtime versions to the renderer.
- `src/renderer/src/`: React UI and appearance preference handling.
- `src/renderer/styles/`: Existing Zeus styles and light/dark theme tokens.
- `docs/`: Project notes.
- `scripts/`: Project scripts.

The renderer has context isolation and sandboxing enabled, with Node.js access disabled. Add narrowly scoped preload methods when native functionality is needed.

## Appearance

`styles.css` and `theme.css` were copied unchanged from `/Users/abg/Projects/Zeus/src/renderer/styles/`. The starter UI uses their existing classes. Light, dark, and system modes are supported, with the previous preference key retained. The previous launcher and native window behavior have not been migrated.

## GitHub

Repository: [alexbguthrie/Zeus](https://github.com/alexbguthrie/Zeus).

GitHub Actions installs locked dependencies and runs the production build on pushes to `main` and pull requests.
