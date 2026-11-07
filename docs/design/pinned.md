# Compact pinned directions

Open `/previews/pinned/` in the browser preview to try the actual tool views in
three layouts. Users choose a saved layout in Settings → Pinned layout. Slim bar is
the default for new profiles and existing profiles without a saved layout.

| Direction      | Presentation                                               |
| -------------- | ---------------------------------------------------------- |
| A · Micro dock | A 176 × 40 px collapsed icon dock, with one tool below it. |
| B · Side rail  | A narrow vertical icon rail, with one tool beside it.      |
| C · Slim bar   | A horizontal icon bar with a shallow inline tool area.     |

Tool names remain in accessible labels and hover tooltips. The compact calculator
uses keyboard input and an equals button. Preview notes use their own storage keys;
preview interactions do not replace existing notes or saved native preferences.

![Three compact pinned workspace directions](pinned-variants.png)

## Tool organization

```text
src/renderer/
  tools/
    registry.ts        # Metadata and availability flags for every tool
    embedded.ts        # Typed embedded view registrations
    ToolIcon.tsx
    notes/
    timer/
    calculator/
    resize-image/
  pinned/
    PinnedWorkspace.tsx # Generic container, no tool-specific state
    pinned.css
    variants.css
```

A tool stays in its own folder when its presentation changes. Marking it `pinned: true`
adds it to the pinned catalog and requires an embedded view registration. Marking it
`launcher: true` requires its standalone page and explicit native registration. Future
user preferences can choose among eligible tools without moving source files.

## Layout and tool contracts

`src/shared/pinned.ts` defines workspace layouts, their preferred presentation, base
width, and open-tool limit. `tools/embedded.ts` separately registers each tool's view,
nonempty list of supported presentations, and minimum content width. The workspace
passes the selected presentation to the tool and falls back to a supported one when
needed. A future tool can provide a larger compact view without pretending to fit inline.

Changing layout keeps tool views mounted, preserving notes, calculations, and running
timers. Native windows resize and remain anchored to the display's top-right corner.
The width requests are validated and clamped by Electron. Recovery errors can expand
a tiny window enough to keep the retry controls usable.

Native preferences retain their existing file location and store appearance and layout
together. Browser preferences use separate keys and leave preview notes isolated.
