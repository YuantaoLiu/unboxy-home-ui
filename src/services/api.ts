import axios from 'axios';
import type { Game, ChatMessage } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    // Get token from Amplify
    const { fetchAuthSession } = await import('aws-amplify/auth');
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('No auth token available:', error);
  }
  return config;
});

export const gameAPI = {
  // Get all games with pagination
  getAllGames: async (page: number = 0, size: number = 12): Promise<{
    items: Game[];
    hasMore: boolean;
    totalElements?: number;
  }> => {
    const response = await api.get(`/games?page=${page}&size=${size}`);
    const data = response.data;
    return {
      items: data.items || [],
      hasMore: data.pagination ? page < data.pagination.totalPages - 1 : false,
      totalElements: data.pagination?.totalElements
    };
  },

  // Get game by ID
  getGame: async (id: string): Promise<Game> => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  // Create a new game
  createGame: async (title: string, description: string): Promise<Game> => {
    const response = await api.post('/games/generate', { 
      title, 
      description,
      gameType: 'arcade', // Default game type
      tags: '' // Empty tags for now
    });
    return response.data;
  },

  // Update game via chat
  updateGameWithChat: async (gameId: string, message: string): Promise<{ 
    response: string; 
    gameUrl?: string; 
    previewUrl?: string; 
  }> => {
    const response = await api.put(`/games/${gameId}/generate`, { userMessage: message });
    return response.data;
  },

  // Get chat history for a game
  getChatHistory: async (gameId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/games/${gameId}/chat`);
    return response.data;
  },
};

export default api;