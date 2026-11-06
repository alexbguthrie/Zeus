import type { LauncherSection } from './sections';

export default function SectionIcon({ id }: { id: LauncherSection['id'] }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {id === 'apps' && (
        <>
          <rect x="5" y="5" width="8" height="8" rx="2.5" />
          <rect x="19" y="5" width="8" height="8" rx="2.5" />
          <rect x="5" y="19" width="8" height="8" rx="2.5" />
          <rect x="19" y="19" width="8" height="8" rx="2.5" />
        </>
      )}
      {id === 'tools' && (
        <path d="m19 5-5 5 8 8 5-5a8 8 0 0 1-10 10L8 30l-6-6 9-9A8 8 0 0 1 19 5Z" />
      )}
      {id === 'files' && (
        <path d="M4 11V8a2 2 0 0 1 2-2h7l3 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V11h24" />
      )}
      {id === 'actions' && (
        <>
          <path d="m18 3-12 15h9l-1 11 12-16h-9l1-10Z" />
        </>
      )}
      {id === 'clipboard' && (
        <>
          <rect x="7" y="7" width="20" height="22" rx="3" />
          <rect x="11" y="3" width="12" height="7" rx="2" />
          <path d="M12 16h10M12 21h7M4 23V8" />
        </>
      )}
    </svg>
  );
}
