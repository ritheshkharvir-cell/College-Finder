import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  'Top engineering colleges in Bangalore?',
  'Which college has best placement?',
  'Compare RVCE and BMS College',
  'Medical colleges with NEET admission',
  'Colleges under 1 lakh fees',
  'Best MBA college in Bangalore',
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm **College Finder AI**, your guide to Bangalore colleges.\n\nI can help you:\n• 🔍 Find colleges by budget, course, location\n• ⚖️ Compare colleges side by side\n• 🎯 Get personalized recommendations\n• 📊 Know about placements, fees, rankings\n\nWhat would you like to know?`,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history
  useEffect(() => {
    chatAPI.getHistory().then(r => {
      if (r.data.history?.length > 0) {
        const hist = r.data.history.slice(-20).map(h => ({ ...h, timestamp: new Date(h.timestamp) }));
        setMessages(prev => [...prev, ...hist]);
      }
    }).catch(() => {});
  }, []);

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const { data } = await chatAPI.send({ message: text, history });
      const aiMsg = { role: 'assistant', content: data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      // Text to speech
      if ('speechSynthesis' in window) {
        const clean = data.response.replace(/[*#\[\]]/g, '');
        const utt = new SpeechSynthesisUtterance(clean.substring(0, 300));
        utt.rate = 1.05;
        utt.onstart = () => setSpeaking(true);
        utt.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(utt);
      }
    } catch (err) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice not supported in this browser');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const clearHistory = async () => {
    await chatAPI.clearHistory();
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared! How can I help you today?',
      timestamp: new Date()
    }]);
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.botAvatar}>🤖</div>
          <div>
            <h2 style={styles.botName}>College Finder AI</h2>
            <div style={styles.statusRow}>
              <div style={styles.statusDot} />
              <span style={styles.statusText}>Online {speaking ? '• Speaking...' : listening ? '• Listening...' : ''}</span>
            </div>
          </div>
        </div>
        <div style={styles.headerActions}>
          {speaking && (
            <button onClick={stopSpeaking} className="btn btn-ghost" style={{ fontSize: 12 }}>🔇 Stop</button>
          )}
          <button onClick={clearHistory} className="btn btn-ghost" style={{ fontSize: 12 }}>🗑️ Clear</button>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={styles.quickRow}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)} style={styles.quickBtn}>{p}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={styles.chatArea}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && <div style={styles.aAvatar}>🤖</div>}
            <div style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
              <div
                style={styles.msgText}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              <div style={styles.msgTime}>
                {msg.timestamp?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div style={styles.uAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            )}
          </div>
        ))}

        {loading && (
          <div style={styles.msgRow}>
            <div style={styles.aAvatar}>🤖</div>
            <div style={styles.aiBubble}>
              <div style={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <button
          onClick={startVoice}
          style={{ ...styles.voiceBtn, ...(listening ? styles.voiceBtnActive : {}) }}
          title="Voice input"
        >
          {listening ? '🔴' : '🎙️'}
        </button>
        <input
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about colleges, fees, placements..."
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={styles.sendBtn}
        >
          {loading ? <div style={styles.sendSpinner} /> : '➤'}
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        .typing span { display:inline-block; width:8px; height:8px; background:var(--text-secondary); border-radius:50%; margin:0 2px; animation:bounce 1.2s infinite; }
        .typing span:nth-child(2){animation-delay:0.2s}
        .typing span:nth-child(3){animation-delay:0.4s}
      `}</style>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 860, margin: '0 auto', padding: '0 24px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 16px', borderBottom: '1px solid var(--border)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  botAvatar: { width: 44, height: 44, background: 'linear-gradient(135deg,#6c63ff,#ff6584)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  botName: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 },
  statusRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 8, height: 8, background: '#43e97b', borderRadius: '50%', boxShadow: '0 0 6px #43e97b' },
  statusText: { fontSize: 12, color: 'var(--text-secondary)' },
  headerActions: { display: 'flex', gap: 8 },
  quickRow: { display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 0', borderBottom: '1px solid var(--border)' },
  quickBtn: { padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.15s' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 },
  msgRow: { display: 'flex', gap: 10, alignItems: 'flex-end' },
  aAvatar: { width: 32, height: 32, background: 'linear-gradient(135deg,#6c63ff,#ff6584)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  uAvatar: { width: 32, height: 32, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 },
  bubble: { maxWidth: '70%', padding: '12px 16px', borderRadius: 16, position: 'relative' },
  aiBubble: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 },
  userBubble: { background: 'var(--accent)', color: '#fff', borderBottomRightRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 1.6 },
  msgTime: { fontSize: 10, opacity: 0.6, marginTop: 6, textAlign: 'right' },
  typing: { display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' },
  inputArea: { display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '8px 12px' },
  voiceBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 6, borderRadius: 8, transition: 'all 0.2s' },
  voiceBtnActive: { background: 'rgba(255,101,132,0.15)', animation: 'pulse 1s infinite' },
  input: { flex: 1, background: 'transparent', border: 'none', fontSize: 14, color: 'var(--text-primary)', padding: '8px 4px', outline: 'none' },
  sendBtn: { width: 40, height: 40, background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sendSpinner: { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
};
