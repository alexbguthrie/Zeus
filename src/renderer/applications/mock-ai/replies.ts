// Deliberately local and deterministic: this mock never calls an AI service.
export function mockReply(prompt: string): string {
  const text = prompt.toLowerCase();
  if (/plan|day|organize|task/.test(text)) {
    return 'Here’s a simple way to give your day some structure:\n\n1. Pick one thing that would make today feel worthwhile.\n2. Set aside a focused block for it.\n3. Group the smaller tasks into a second block.\n4. Leave a little room between things.\n\nYou can keep a note and a timer open in the pinned Zeus hub while you work.';
  }
  if (/write|draft|email|story/.test(text)) {
    return 'Let’s start with a short draft:\n\n“Hi there,\n\nI wanted to share a quick update and outline the next steps. We’ve made a solid start, and I’d love your thoughts on what would be most useful to focus on next.\n\nThanks!”\n\nYou could make this more formal, more concise, or more conversational depending on the audience.';
  }
  if (/explain|learn|how|why/.test(text)) {
    return 'A useful way to understand something new is to break it into three parts:\n\n• What it does.\n• What goes in and what comes out.\n• One small example you can try yourself.\n\nFor example, Zeus’s launcher finds a registered app, asks the desktop process to open it, and then hands focus to that app’s window.';
  }
  return 'This is a sample reply from Zeus AI. You can use this conversation to test typing, scrolling, switching chats, and returning to the launcher.\n\nTry “Plan my day”, “Help me write an email”, or “Explain how Zeus opens an app” for a few different example responses.';
}
