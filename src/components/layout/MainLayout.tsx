import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { ChatList } from '../chat/ChatList';
import { ChatDetail } from '../chat/ChatDetail';
import { ContactsList } from '../contacts/ContactsList';
import { InviteUser } from '../contacts/InviteUser';
import { Profile } from '../profile/Profile';
import type { Room } from '../../types';

type Tab = 'chats' | 'contacts' | 'profile';
type Screen = 'main' | 'chat' | 'invite';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [screen, setScreen] = useState<Screen>('main');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setScreen('chat');
  };

  const handleBackToMain = () => {
    setScreen('main');
    setSelectedRoom(null);
  };

  if (screen === 'chat' && selectedRoom) {
    return <ChatDetail room={selectedRoom} onBack={handleBackToMain} />;
  }

  if (screen === 'invite') {
    return <InviteUser onBack={() => setScreen('main')} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chats' && <ChatList onSelectRoom={handleSelectRoom} />}
        {activeTab === 'contacts' && <ContactsList onInvite={() => setScreen('invite')} />}
        {activeTab === 'profile' && <Profile />}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
