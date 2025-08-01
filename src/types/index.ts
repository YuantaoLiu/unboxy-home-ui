export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  gameStatus: string;
  gameType: string;
  s3GameUrl?: string;
  publicGameUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string;
  generatedPrompt?: string;
  posterUrl?: string;
  aiResponse?: string;
  // Legacy fields for backwards compatibility
  createdBy?: string;
  gameUrl?: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GameSession {
  gameId: string;
  messages: ChatMessage[];
}