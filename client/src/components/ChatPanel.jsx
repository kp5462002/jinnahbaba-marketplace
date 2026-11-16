import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api/fetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { Send } from 'lucide-react';

export default function ChatPanel({ orderId }) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    const token = localStorage.getItem('accessToken');
    setLoading(true);
    apiFetch(`/messages/order/${orderId}?markRead=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load messages')))
      .then(d => setMessages(d.messages || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (!socket || !orderId) return;
    socket.emit('join_order', orderId);

    const onNewMessage = (msg) => {
      if (msg.orderId !== orderId) return;
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    };
    const onTyping = ({ userId, isTyping }) => {
      if (userId === user?.id) return;
      setTypingUser(isTyping ? 'The other party' : null);
    };

    socket.on('new_message', onNewMessage);
    socket.on('typing', onTyping);

    return () => {
      socket.emit('leave_order', orderId);
      socket.off('new_message', onNewMessage);
      socket.off('typing', onTyping);
    };
  }, [socket, orderId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    const text = content.trim();
    setContent('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await apiFetch(`/messages/order/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error('Failed to send');
    } catch (err) {
      setError(err.message);
      setContent(text);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing', { orderId, isTyping: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { orderId, isTyping: false });
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border flex flex-col h-[500px]">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h2 className="font-bold">Order Chat</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {connected ? '● Live' : '○ Connecting...'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-sm text-gray-500 text-center">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No messages yet. Start the conversation.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-[#00A651] text-white' : 'bg-gray-100 text-gray-800'}`}>
                {!mine && (
                  <div className="text-[10px] font-bold mb-0.5 opacity-70">
                    {m.sender?.companyName || m.sender?.contactName || 'User'}
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {typingUser && <p className="text-xs text-gray-400 italic">{typingUser} is typing...</p>}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-xs text-red-500 px-4 pb-1">{error}</p>}

      <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => { setContent(e.target.value); handleTyping(); }}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-[#00A651]"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-[#00A651] hover:bg-[#008a44] disabled:opacity-50 text-white rounded-full p-2.5 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}