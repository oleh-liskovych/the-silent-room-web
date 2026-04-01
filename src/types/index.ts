export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profilePictureUrl?: string | null;
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface Contact {
  id: string;
  userId: string;
  contactId: string;
  contactUsername: string;
  contactDisplayName: string;
  contactProfilePictureUrl?: string | null;
  status: string;
  createdAt: string;
}

export interface RoomMember {
  userId: string;
  username: string;
  displayName: string;
  profilePictureUrl?: string | null;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  content: string;
  messageType: string;
  status: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string | null;
  isGroup: boolean;
  members: RoomMember[];
  lastMessage?: Message | null;
  createdAt: string;
}

export interface MessagePage {
  messages: Message[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface WsMessage {
  type: string;
  roomId?: string;
  content?: string;
  messageId?: string;
  senderId?: string;
  senderUsername?: string;
  senderDisplayName?: string;
  messageType?: string;
  status?: string;
  timestamp?: string;
  error?: string;
}
