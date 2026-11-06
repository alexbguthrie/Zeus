# Working on Zeus

Keep changes easy to locate, read, and verify. Use the [code map](docs/architecture.md)
to find the feature or desktop responsibility you are changing.

## Put code with its feature

- Keep a feature's components, hooks, helpers, and styles together in its folder.
- Put native desktop behavior in `src/main/`, narrow bridges in `src/preload/`,
  and contracts used across processes in `src/shared/`.
- Keep feature-specific types beside the code that uses them. Extract shared
  components or helpers when multiple features actually need them.
- Keep startup files focused on assembling the application. Split a file when it
  contains distinct responsibilities; choose boundaries that make sense to a reader.

## Use predictable names

| Kind                     | Convention                               | Example                         |
| ------------------------ | ---------------------------------------- | ------------------------------- |
| React component and file | PascalCase                               | `SearchBar.tsx`                 |
| React hook and file      | camelCase starting with `use`            | `useLauncherKeyboard.ts`        |
| Feature folder           | Lowercase, kebab-case for multiple words | `resize-image/`                 |
| Native module            | Lowercase, kebab-case for multiple words | `launcher-window.ts`            |
| Function or variable     | Descriptive camelCase                    | `openSection`, `selectedResult` |
| Stylesheet               | Name the feature it styles               | `launcher.css`                  |

Use names that describe the job. Keep naming consistent with neighboring files.

## Make inputs and behavior clear

- Declare component inputs with a nearby `Props` type and hook configuration with
  an `Options` type. Put each input on its own line when formatting wraps the list.
- Use `Pick` when inputs deliberately reuse part of an existing contract.
- Let TypeScript infer straightforward local values. Use explicit types for
  component inputs and contracts between modules or processes.
- Treat data arriving through IPC, storage, or files as untrusted input and validate
  it before use. TypeScript types alone do not validate runtime data.
- Keep rendering in components, state and effects in hooks, and calculations or
  matching logic in ordinary functions. Clean up listeners and timers in effects.
- Keep state with the component or hook that owns it. Remember that tucking away a
  pinned card must preserve its state and any running timer.

## Keep styles and explanations readable

- Keep feature CSS beside its components. Use `src/renderer/styles/` for global
  defaults and theme tokens; use those tokens for colors that follow appearance.
- Let Prettier handle indentation, quotes, and line wrapping. VS Code formats on
  save; `npm run format` applies the same rules from the terminal.
- Comment on decisions, constraints, and unusual behavior. Explain why a native
  transition needs a layout acknowledgement or why a storage key retains an old name.
- Update the code map when a feature moves or its responsibilities change.

## Check a change before sharing it

Run `npm run check` for TypeScript and formatting. Run `npm run build` when changing
imports, entry points, native code, preloads, or build configuration; it includes
those same checks and compiles all application pages.

Exercise the affected behavior with `npm run dev`. Until repeatable desktop checks
are added to the repository, describe what you tried and any limitations when
sharing a change. Generated output belongs in `out/` and stays out of Git.

Preserve existing notes and preferences. Changes to storage identifiers need a data
migration. Native operations must keep their sender checks and fixed application
IDs. See the code map's [compatibility notes](docs/architecture.md#compatibility)
before changing window transitions or persistence.
