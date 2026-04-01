import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { Avatar } from '../layout/Avatar';
import type { Room } from '../../types';

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const dayMs = 86400000;
  if (diff < dayMs) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 7 * dayMs) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'SENT': return '✓';
    case 'RECEIVED': return '✓✓';
    case 'SEEN': return '✓✓';
    default: return '';
  }
}

export function ChatList({ onSelectRoom }: { onSelectRoom: (room: Room) => void }) {
  const { user } = useAuth();
  const { lastMessage } = useWebSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadRooms = useCallback(async () => {
    try {
      const data = await api.getRooms();
      setRooms(data);
    } catch { /* silently ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  useEffect(() => {
    if (lastMessage?.type === 'NEW_MESSAGE' || lastMessage?.type === 'MESSAGE_STATUS') {
      loadRooms();
    }
  }, [lastMessage, loadRooms]);

  const getOtherMember = (room: Room) => {
    return room.members.find(m => m.userId !== user?.id) || room.members[0];
  };

  const filtered = rooms.filter(room => {
    if (!search) return true;
    const other = getOtherMember(room);
    return other.displayName.toLowerCase().includes(search.toLowerCase()) ||
           other.username.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Chats</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Add contacts to start chatting</p>
          </div>
        ) : (
          filtered.map(room => {
            const other = getOtherMember(room);
            const lastMsg = room.lastMessage;
            const isMyMsg = lastMsg?.senderId === user?.id;
            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                <Avatar src={other.profilePictureUrl} name={other.displayName} size="md" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {other.displayName}
                    </h3>
                    {lastMsg && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {isMyMsg && (
                        <span className={`mr-1 ${lastMsg.status === 'SEEN' ? 'text-indigo-500' : ''}`}>
                          {getStatusIcon(lastMsg.status)}
                        </span>
                      )}
                      {lastMsg.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
