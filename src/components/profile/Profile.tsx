import { useState } from 'react';
import { LogOut, Moon, Sun, Monitor, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../layout/Avatar';
import { api } from '../../services/api';

export function Profile() {
  const { user, signOut, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    if (displayName === user.displayName) return;
    setSaving(true);
    try {
      await api.updateMe({ displayName });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silently ignore */ } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const themeOptions: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div className="relative">
            <Avatar src={user.profilePictureUrl} name={user.displayName} size="xl" />
            <button className="absolute bottom-0 right-0 p-2 bg-indigo-500 dark:bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-600 dark:hover:bg-indigo-700 transition">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Username (read-only) */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Username
          </label>
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400">
            @{user.username}
          </div>
        </div>

        {/* Display Name */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Display Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {displayName !== user.displayName && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-3 bg-indigo-500 dark:bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? '...' : saved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Theme
          </label>
          <div className="flex gap-2">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition ${
                  theme === value
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${theme === value ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium ${theme === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="mb-6 text-center text-xs text-gray-400 dark:text-gray-500">
          The Silent Room v0.1.0
        </div>

        {/* Log Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 flex items-center justify-center gap-2 text-red-500 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
