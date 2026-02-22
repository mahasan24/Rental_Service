import { useState, useRef, useEffect, useMemo } from 'react';
import client from '../api/client';

// Simple function to render text with basic formatting
function formatMessage(text) {
  if (!text) return null;
  
  // Split by newlines and process each line
  const lines = text.split('\n');
  
  return lines.map((line, i) => {
    // Check if it's a bullet point
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    const content = isBullet ? line.replace(/^[\s]*[•-]\s*/, '') : line;
    
    if (isBullet) {
      return (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginTop: i > 0 ? '0.25rem' : 0 }}>
          <span>•</span>
          <span>{content}</span>
        </div>
      );
    }
    
    return line ? <div key={i} style={{ marginTop: i > 0 ? '0.5rem' : 0 }}>{line}</div> : <br key={i} />;
  });
}

const COLORS = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
  border: '#e2e8f0',
};

export default function FaqBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your Rentel assistant. How can I help you today? Ask me about our vans, booking process, pricing, or anything else!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await client.post('/ai/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again or contact our support team.' 
      }]);
    } finally {
      setLoading(false);
    }
  }

  const quickQuestions = [
    'What types of vans do you have?',
    'How do I book a van?',
    'What\'s your cancellation policy?',
    'Do you offer insurance?',
  ];

  const s = {
    container: {
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    toggleBtn: {
      width: 60,
      height: 60,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.primary} 100%)`,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    toggleIcon: {
      fontSize: '1.75rem',
      color: COLORS.white,
    },
    chatWindow: {
      position: 'absolute',
      bottom: 80,
      right: 0,
      width: 380,
      maxWidth: 'calc(100vw - 48px)',
      height: 500,
      maxHeight: 'calc(100vh - 120px)',
      background: COLORS.white,
      borderRadius: 20,
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideUp 0.3s ease-out',
    },
    header: {
      padding: '1rem 1.25rem',
      background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.primary} 100%)`,
      color: COLORS.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
    },
    headerText: {
      fontWeight: 700,
      fontSize: '1rem',
    },
    headerSubtext: {
      fontSize: '0.75rem',
      opacity: 0.8,
    },
    closeBtn: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: '50%',
      width: 32,
      height: 32,
      cursor: 'pointer',
      color: COLORS.white,
      fontSize: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    message: {
      maxWidth: '85%',
      padding: '0.75rem 1rem',
      borderRadius: 16,
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
    userMessage: {
      alignSelf: 'flex-end',
      background: COLORS.accent,
      color: COLORS.white,
      borderBottomRightRadius: 4,
    },
    assistantMessage: {
      alignSelf: 'flex-start',
      background: COLORS.light,
      color: COLORS.primary,
      borderBottomLeftRadius: 4,
    },
    quickQuestions: {
      padding: '0.75rem 1rem',
      borderTop: `1px solid ${COLORS.border}`,
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    quickBtn: {
      padding: '0.4rem 0.75rem',
      background: COLORS.light,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 20,
      fontSize: '0.75rem',
      color: COLORS.muted,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    inputArea: {
      padding: '1rem',
      borderTop: `1px solid ${COLORS.border}`,
      display: 'flex',
      gap: '0.75rem',
    },
    input: {
      flex: 1,
      padding: '0.75rem 1rem',
      border: `2px solid ${COLORS.border}`,
      borderRadius: 12,
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    sendBtn: {
      padding: '0.75rem 1rem',
      background: COLORS.accent,
      color: COLORS.white,
      border: 'none',
      borderRadius: 12,
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background 0.2s',
    },
    typing: {
      display: 'flex',
      gap: '0.25rem',
      padding: '0.75rem 1rem',
      background: COLORS.light,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: COLORS.muted,
      animation: 'bounce 1.4s infinite ease-in-out',
    },
  };

  return (
    <div style={s.container}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>

      {isOpen && (
        <div style={s.chatWindow}>
          <div style={s.header}>
            <div style={s.headerTitle}>
              <div style={s.headerIcon}>🤖</div>
              <div>
                <div style={s.headerText}>Rentel Assistant</div>
                <div style={s.headerSubtext}>Powered by AI</div>
              </div>
            </div>
            <button style={s.closeBtn} onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div style={s.messagesArea}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...s.message,
                  ...(msg.role === 'user' ? s.userMessage : s.assistantMessage),
                }}
              >
                {msg.role === 'user' ? msg.content : formatMessage(msg.content)}
              </div>
            ))}
            {loading && (
              <div style={s.typing}>
                <div style={{ ...s.dot, animationDelay: '0s' }} />
                <div style={{ ...s.dot, animationDelay: '0.2s' }} />
                <div style={{ ...s.dot, animationDelay: '0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div style={s.quickQuestions}>
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  style={s.quickBtn}
                  onClick={() => { setInput(q); }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form style={s.inputArea} onSubmit={handleSend}>
            <input
              style={s.input}
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button style={s.sendBtn} type="submit" disabled={loading}>
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        style={s.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close chat' : 'Chat with us'}
      >
        <span style={s.toggleIcon}>{isOpen ? '×' : '💬'}</span>
      </button>
    </div>
  );
}
