import { useState, useRef, useEffect } from 'react';
import client from '../api/client';

const QUICK_QUESTIONS = [
  'How do I book a van?',
  'What van types do you have?',
  'How is the price calculated?',
  'What if I need to cancel?',
];

export default function FaqBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm the Rentel FAQ assistant. Ask me anything about vans, bookings, or pricing." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(question) {
    const q = (question || input).trim();
    if (!q || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    try {
      const res = await client.post('/faq', { question: q });
      const { answer, confidence, sources } = res.data;
      let botText = answer;
      if (confidence > 0 && confidence < 40) {
        botText += "\n\n_I'm not very confident about this answer. You might want to contact support._";
      }
      if (sources && sources.length > 1) {
        botText += `\n\n📄 Found in: ${sources.map(s => s.source).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`;
      }
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const s = {
    toggle: {
      position: 'fixed', bottom: 24, right: 24, width: 56, height: 56,
      borderRadius: '50%', background: '#2563eb', color: '#fff', border: 'none',
      fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, transition: 'transform 0.2s',
    },
    panel: {
      position: 'fixed', bottom: 92, right: 24, width: 380, maxHeight: 520,
      borderRadius: 16, background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden',
    },
    header: {
      padding: '1rem 1.25rem', background: '#2563eb', color: '#fff',
      fontWeight: 700, fontSize: '1rem', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center',
    },
    closeBtn: {
      background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem',
      cursor: 'pointer', padding: 0,
    },
    body: {
      flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex',
      flexDirection: 'column', gap: '0.75rem', maxHeight: 340,
    },
    msgBot: {
      alignSelf: 'flex-start', background: '#f0f4ff', color: '#1e293b',
      padding: '0.6rem 0.9rem', borderRadius: '12px 12px 12px 4px',
      maxWidth: '85%', fontSize: '0.88rem', lineHeight: 1.45, whiteSpace: 'pre-wrap',
    },
    msgUser: {
      alignSelf: 'flex-end', background: '#2563eb', color: '#fff',
      padding: '0.6rem 0.9rem', borderRadius: '12px 12px 4px 12px',
      maxWidth: '85%', fontSize: '0.88rem', lineHeight: 1.45,
    },
    quickBar: {
      display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.5rem 1rem',
      borderTop: '1px solid #f0f0f0',
    },
    quickBtn: {
      padding: '0.3rem 0.7rem', fontSize: '0.75rem', borderRadius: 20,
      border: '1px solid #d0d5dd', background: '#fafafa', cursor: 'pointer',
      color: '#374151', transition: 'background 0.15s',
    },
    inputBar: {
      display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem',
      borderTop: '1px solid #e5e7eb',
    },
    input: {
      flex: 1, padding: '0.55rem 0.75rem', border: '1px solid #d1d5db',
      borderRadius: 8, fontSize: '0.88rem', outline: 'none',
    },
    sendBtn: {
      padding: '0.55rem 1rem', background: '#2563eb', color: '#fff', border: 'none',
      borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
    },
    typing: {
      alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.82rem',
      fontStyle: 'italic', padding: '0.3rem 0',
    },
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={s.panel}>
          <div style={s.header}>
            <span>Rentel FAQ Bot</span>
            <button style={s.closeBtn} onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div style={s.body}>
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === 'bot' ? s.msgBot : s.msgUser}>
                {msg.text}
              </div>
            ))}
            {loading && <div style={s.typing}>Thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <div style={s.quickBar}>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} style={s.quickBtn} onClick={() => handleSend(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>

          <div style={s.inputBar}>
            <input
              style={s.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              disabled={loading}
            />
            <button style={s.sendBtn} onClick={() => handleSend()} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        style={{ ...s.toggle, transform: open ? 'rotate(90deg)' : 'none' }}
        onClick={() => setOpen(!open)}
        aria-label="Toggle FAQ Bot"
      >
        {open ? '✕' : '?'}
      </button>
    </>
  );
}
