# Sample applications

This folder contains sample app interfaces that Zeus can open in separate windows.

## Zeus AI

1. Run `npm run dev`.
2. Open the launcher with Command+/.
3. Type **Zeus AI** and press Enter, or choose **Apps** (Command+1),
   then select **Zeus AI**. Up/Down changes the highlighted result; Enter opens it.

The app has a light chat interface, new conversations, history within the current
window, suggestion prompts, a message composer, stopping, and copying replies.
Enter sends a message; Shift+Enter adds a line. Replies are deterministic local
samples. No AI provider, API key, or network request is used for replies.

Launching again focuses the existing window and preserves the current chats.
Closing that window ends the sample session; launching again starts a new one.

With `npm run dev:browser`, the launcher opens the same page in a browser popup.
The page can also be visited directly at
http://127.0.0.1:5173/applications/mock-ai/index.html.

## Files

- `registry.ts`: launcher-facing names, descriptions, and search keywords.
- `mock-ai/`: the sample app's HTML, React interface, CSS, and reply generator.
- `../../main/applications.ts`: native window creation, reuse, and restoration.

Vite builds both the launcher and this app as separate HTML entry points.
The native bridge accepts an approved app ID rather than an arbitrary file path.
The mock chat window has no launcher bridge or Node.js access.

The sample app follows the appearance chosen in Zeus’s tray settings, including
updates while the window is already open.
