import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { Avatar } from '../layout/Avatar';
import type { Room, Message } from '../../types';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'CREATED': return '○';
    case 'SENT': return '✓';
    case 'RECEIVED': return '✓✓';
    case 'SEEN': return '✓✓';
    default: return '';
  }
}

export function ChatDetail({ room, onBack }: { room: Room; onBack: () => void }) {
  const { user } = useAuth();
  const { sendMessage: wsSend, lastMessage: wsMsg } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  const otherMember = room.members.find(m => m.userId !== user?.id) || room.members[0];

  const loadMessages = useCallback(async () => {
    try {
      const data = await api.getMessages(room.id);
      setMessages(data.messages.reverse());
    } catch { /* silently ignore */ } finally {
      setLoading(false);
    }
  }, [room.id]);

  useEffect(() => {
    loadMessages();
    wsSend({ type: 'JOIN_ROOM', roomId: room.id });
  }, [loadMessages, wsSend, room.id]);

  useEffect(() => {
    if (!wsMsg) return;
    if (wsMsg.type === 'NEW_MESSAGE' && wsMsg.roomId === room.id) {
      const newMsg: Message = {
        id: wsMsg.messageId || crypto.randomUUID(),
        roomId: wsMsg.roomId!,
        senderId: wsMsg.senderId || '',
        senderUsername: wsMsg.senderUsername || '',
        senderDisplayName: wsMsg.senderDisplayName || '',
        content: wsMsg.content || '',
        messageType: wsMsg.messageType || 'TEXT',
        status: wsMsg.status || 'SENT',
        createdAt: wsMsg.timestamp || new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      if (wsMsg.senderId !== user?.id) {
        wsSend({ type: 'MESSAGE_READ', roomId: room.id });
      }
    }
    if (wsMsg.type === 'IS_TYPING' && wsMsg.roomId === room.id && wsMsg.senderId !== user?.id) {
      setIsTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setIsTyping(false), 3000);
    }
    if (wsMsg.type === 'MESSAGE_STATUS' && wsMsg.roomId === room.id) {
      setMessages(prev =>
        prev.map(m => m.id === wsMsg.messageId ? { ...m, status: wsMsg.status || m.status } : m)
      );
    }
  }, [wsMsg, room.id, user?.id, wsSend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const optimistic: Message = {
      id: crypto.randomUUID(),
      roomId: room.id,
      senderId: user!.id,
      senderUsername: user!.username,
      senderDisplayName: user!.displayName,
      content: input.trim(),
      messageType: 'TEXT',
      status: 'CREATED',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    wsSend({ type: 'SEND_MESSAGE', roomId: room.id, content: input.trim() });
    setInput('');
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    wsSend({ type: 'IS_TYPING', roomId: room.id });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Avatar src={otherMember.profilePictureUrl} name={otherMember.displayName} size="sm" />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-white truncate">{otherMember.displayName}</h2>
          {isTyping && <p className="text-xs text-indigo-500 dark:text-indigo-400">is typing...</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isMine
                      ? 'bg-indigo-500 dark:bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                    {isMine && (
                      <span className={`text-[10px] ${msg.status === 'SEEN' ? 'text-white' : ''}`}>
                        {getStatusIcon(msg.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <Plus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 bg-indigo-500 dark:bg-indigo-600 rounded-xl text-white hover:bg-indigo-600 dark:hover:bg-indigo-700 transition disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
