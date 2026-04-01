import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Check, X, Clock, UserMinus } from 'lucide-react';
import { api } from '../../services/api';
import { Avatar } from '../layout/Avatar';
import type { Contact } from '../../types';

export function ContactsList({ onInvite }: { onInvite: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [incoming, setIncoming] = useState<Contact[]>([]);
  const [outgoing, setOutgoing] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [c, i, o] = await Promise.all([
        api.getContacts(),
        api.getIncomingInvitations(),
        api.getOutgoingInvitations(),
      ]);
      setContacts(c);
      setIncoming(i);
      setOutgoing(o);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRespond = async (id: string, accept: boolean) => {
    try {
      await api.respondToInvitation(id, accept);
      loadAll();
    } catch {}
  };

  const handleRemove = async (id: string) => {
    try {
      await api.removeContact(id);
      loadAll();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 relative">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Incoming Requests */}
        {incoming.length > 0 && (
          <div className="mb-4">
            <h2 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Incoming Requests
            </h2>
            {incoming.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={inv.contactDisplayName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{inv.contactDisplayName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{inv.contactUsername}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(inv.id, true)}
                    className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRespond(inv.id, false)}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Outgoing Requests */}
        {outgoing.length > 0 && (
          <div className="mb-4">
            <h2 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Outgoing Requests
            </h2>
            {outgoing.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={inv.contactDisplayName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{inv.contactDisplayName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{inv.contactUsername}</p>
                </div>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}

        {/* Contacts */}
        <div>
          <h2 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Contacts
          </h2>
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
              <p className="text-sm">No contacts yet</p>
              <p className="text-xs mt-1">Invite someone to get started</p>
            </div>
          ) : (
            contacts.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 group">
                <Avatar name={c.contactDisplayName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{c.contactDisplayName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{c.contactUsername}</p>
                </div>
                <button
                  onClick={() => handleRemove(c.id)}
                  className="p-2 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onInvite}
        className="absolute bottom-20 right-4 p-4 bg-indigo-500 dark:bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-600 dark:hover:bg-indigo-700 transition"
      >
        <UserPlus className="w-6 h-6" />
      </button>
    </div>
  );
}
