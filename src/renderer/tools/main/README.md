# Main tools

Developer tools opened from the launcher's **Tools** section live here.

- `registry.ts`: tool names, descriptions, search keywords, and entry pages.
- `resize-image/`: the Resize Image interface and local canvas processing.

Keep native windows and IPC in `../../../main/`. Native tool IDs are explicitly
allowed in `src/main/index.ts`; `tool-windows.ts` creates the isolated tool window.
Tools have a read-only appearance bridge and no Node.js or launcher access.
Resize Image also has a narrow save bridge that opens a native Save dialog.
