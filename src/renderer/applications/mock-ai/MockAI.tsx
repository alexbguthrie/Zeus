import { useEffect, useRef, useState } from 'react';
import { mockReply } from './replies';
import { useAppearance } from '../../settings/useAppearance';

type Message = { id: string; role: 'user' | 'assistant'; text: string };
type Chat = { id: string; title: string; messages: Message[] };
const starters = [
  { icon: 'plan', label: 'Plan my day', prompt: 'Help me plan a focused, balanced day.' },
  {
    icon: 'write',
    label: 'Help me write',
    prompt: 'Help me write a short, friendly email with a project update.',
  },
  { icon: 'learn', label: 'Explain something', prompt: 'Explain how Zeus opens a sample app.' },
] as const;

function Icon({ name }: { name: string }) {
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
      {name === 'sidebar' && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M9 4v16" />
        </>
      )}
      {name === 'new' && (
        <>
          <path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5M13 11l7-7M16 4h4v4" />
        </>
      )}
      {name === 'plan' && (
        <>
          <rect x="4" y="5" width="16" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M4 11h16M8 15h3" />
        </>
      )}
      {name === 'write' && (
        <>
          <path d="m5 15 12-12 4 4L9 19l-6 2 2-6ZM14 6l4 4" />
        </>
      )}
      {name === 'learn' && (
        <>
          <path d="m12 3 10 5-10 5L2 8l10-5ZM6 10v7c4 3 8 3 12 0v-7M22 8v8" />
        </>
      )}
      {name === 'send' && <path d="M12 19V5M6 11l6-6 6 6" />}
      {name === 'chat' && <path d="M21 12a8 8 0 0 1-8 8H5l-3 2 1-6a9 9 0 1 1 18-4Z" />}
    </svg>
  );
}

export default function MockAI() {
  useAppearance();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sidebar, setSidebar] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = chats.find((chat) => chat.id === activeId);
  const messages = active?.messages ?? [];
  const waiting = pendingId === activeId && pendingId !== null;

  useEffect(() => {
    input.current?.focus();
    return () => {
      if (responseTimer.current) clearTimeout(responseTimer.current);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [activeId, messages.length, waiting]);
  useEffect(() => {
    function newChatShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        newChat();
      }
    }
    window.addEventListener('keydown', newChatShortcut);
    return () => window.removeEventListener('keydown', newChatShortcut);
  }, []);

  function newChat() {
    setActiveId(null);
    setDraft('');
    setCopyError('');
    input.current?.focus();
  }
  function send() {
    const text = draft.trim();
    if (!text || pendingId || text.length > 8000) return;
    const id = activeId ?? crypto.randomUUID();
    const message: Message = { id: crypto.randomUUID(), role: 'user', text };
    setChats((current) => {
      if (current.some((chat) => chat.id === id))
        return current.map((chat) =>
          chat.id === id ? { ...chat, messages: [...chat.messages, message] } : chat,
        );
      return [
        { id, title: text.length > 38 ? `${text.slice(0, 38)}…` : text, messages: [message] },
        ...current,
      ];
    });
    setActiveId(id);
    setDraft('');
    setPendingId(id);
    responseTimer.current = setTimeout(() => {
      const response: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: mockReply(text),
      };
      setChats((current) =>
        current.map((chat) =>
          chat.id === id ? { ...chat, messages: [...chat.messages, response] } : chat,
        ),
      );
      setPendingId(null);
      responseTimer.current = null;
    }, 650);
    input.current?.focus();
  }
  function stop() {
    if (responseTimer.current) clearTimeout(responseTimer.current);
    responseTimer.current = null;
    setPendingId(null);
  }
  async function copy(message: Message) {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedId(message.id);
      setCopyError('');
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopyError('Could not copy. You can select the reply text instead.');
    }
  }

  return (
    <div className={`ai-app ${sidebar ? '' : 'sidebar-hidden'}`}>
      <header className="ai-topbar">
        <button
          className="icon-button"
          onClick={() => setSidebar((value) => !value)}
          aria-label={sidebar ? 'Hide sidebar' : 'Show sidebar'}
          title="Toggle sidebar"
        >
          <Icon name="sidebar" />
        </button>
        <span className="window-title">Zeus AI</span>
        <span className="demo-tag">Local demo</span>
      </header>
      {sidebar && (
        <aside className="ai-sidebar" aria-label="Chat history">
          <button className="new-chat" onClick={newChat}>
            <Icon name="new" />
            <span>New chat</span>
            <kbd>⇧⌘O</kbd>
          </button>
          <p className="sidebar-label">Recent chats</p>
          <nav className="chat-list" aria-label="Conversations">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={chat.id === activeId ? 'is-active' : ''}
                aria-current={chat.id === activeId ? 'page' : undefined}
                onClick={() => {
                  setActiveId(chat.id);
                  setDraft('');
                  setCopyError('');
                  input.current?.focus();
                }}
                title={chat.title}
              >
                <Icon name="chat" />
                <span>{chat.title}</span>
              </button>
            ))}
            {!chats.length && <p className="history-empty">Your conversations will appear here.</p>}
          </nav>
          <div className="sidebar-profile">
            <span className="profile-mark">Z</span>
            <div>
              <strong>Zeus workspace</strong>
              <span>Sample application</span>
            </div>
          </div>
        </aside>
      )}

      <main className={`ai-main ${messages.length ? 'has-messages' : ''}`}>
        <div className="chat-toolbar">
          <span>
            Zeus AI <span className="model-name">/ Demo</span>
          </span>
          {messages.length > 0 && (
            <button className="text-button" onClick={newChat}>
              New chat
            </button>
          )}
        </div>
        {messages.length === 0 ? (
          <section className="welcome">
            <div className="welcome-mark" aria-hidden="true">
              <Icon name="chat" />
            </div>
            <h1>What can I help with?</h1>
            <p>A little space to think, write, and explore.</p>
          </section>
        ) : (
          <div className="conversation" role="log" aria-label="Conversation" aria-live="polite">
            <div className="messages">
              {messages.map((message) => (
                <article
                  className={`message ${message.role}`}
                  key={message.id}
                  aria-label={message.role === 'user' ? 'Your message' : 'Zeus AI reply'}
                >
                  {message.role === 'assistant' && <span className="assistant-name">Zeus AI</span>}
                  <div className="message-text">{message.text}</div>
                  {message.role === 'assistant' && (
                    <button className="copy-button" onClick={() => void copy(message)}>
                      {copiedId === message.id ? 'Copied' : 'Copy reply'}
                    </button>
                  )}
                </article>
              ))}
              {waiting && (
                <div className="thinking" role="status">
                  <span />
                  <span />
                  <span />
                  <span className="visually-hidden">Preparing a sample reply</span>
                </div>
              )}
              <div ref={bottom} />
            </div>
          </div>
        )}

        <div className="composer-area">
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <textarea
              ref={input}
              aria-label="Message Zeus AI"
              placeholder="Message Zeus AI…"
              value={draft}
              maxLength={8000}
              rows={2}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  send();
                }
              }}
            />
            <div className="composer-controls">
              <span>Demo replies</span>
              {waiting ? (
                <button
                  className="send-button stop-button"
                  type="button"
                  onClick={stop}
                  aria-label="Stop response"
                >
                  <span />
                </button>
              ) : (
                <button
                  className="send-button"
                  type="submit"
                  disabled={!draft.trim() || pendingId !== null}
                  aria-label="Send message"
                >
                  <Icon name="send" />
                </button>
              )}
            </div>
          </form>
          {!messages.length && (
            <div className="starter-list">
              {starters.map((starter) => (
                <button
                  key={starter.icon}
                  onClick={() => {
                    setDraft(starter.prompt);
                    input.current?.focus();
                  }}
                >
                  <Icon name={starter.icon} />
                  {starter.label}
                </button>
              ))}
            </div>
          )}
          <p className="composer-note" role="status">
            {copyError || 'Local mock responses · No AI service connected'}
          </p>
        </div>
      </main>
    </div>
  );
}
