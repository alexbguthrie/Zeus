import type { PinnedTool } from './PinnedWorkspace';

export default function PinnedToolIcon({ tool }: { tool: PinnedTool }) {
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
