import { useState } from 'react';
import { ArrowLeft, Send, Shield } from 'lucide-react';
import { api } from '../../services/api';

export function InviteUser({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!username.trim()) return;
    setStatus('sending');
    setError('');
    try {
      await api.sendInvitation(username.trim());
      setStatus('sent');
      setUsername('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Partner</h2>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Partner's Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setStatus('idle'); }}
            placeholder="Enter exact username"
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {status === 'sent' && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg text-sm">
            Invitation sent successfully!
          </div>
        )}

        <button
          onClick={handleInvite}
          disabled={!username.trim() || status === 'sending'}
          className="w-full py-3 bg-indigo-500 dark:bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-600 dark:hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {status === 'sending' ? 'Sending...' : 'Send Invitation'}
        </button>

        <div className="mt-8 flex items-start gap-3 text-gray-400 dark:text-gray-500">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            For your privacy, you can only add contacts by entering their exact username. 
            There is no search or discovery feature.
          </p>
        </div>
      </div>
    </div>
  );
}
