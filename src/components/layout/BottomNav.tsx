import { MessageSquare, Users, User } from 'lucide-react';

type Tab = 'chats' | 'contacts' | 'profile';

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center py-3 transition-colors ${
              active === id
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <div className={`p-1.5 rounded-2xl ${active === id ? 'bg-indigo-100 dark:bg-indigo-900/40' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs mt-0.5 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
