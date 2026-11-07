import type { ToolId } from './registry';

export default function ToolIcon({ tool }: { tool: ToolId }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tool === 'stocks' && (
        <>
          <path d="M4 19V5M4 19h16M7 14l4-5 4 3 5-7M16 5h4v4" />
        </>
      )}
      {tool === 'resize-image' && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 14V8h6M8 8l8 8m0-5v5h-5" />
        </>
      )}
      {tool === 'notes' && (
        <>
          <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
          <path d="m12 12 7-8 2 2-7 8-4 1 2-3ZM8 8h3M8 17h7" />
        </>
      )}
      {tool === 'timer' && (
        <>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2M9 2h6M12 2v3M18 5l2-2" />
        </>
      )}
      {tool === 'calculator' && (
        <>
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <path d="M8 6h8M8 11h1M15 11h1M8 15h1M15 15h1M8 19h1M15 19h1" />
        </>
      )}
    </svg>
  );
}
