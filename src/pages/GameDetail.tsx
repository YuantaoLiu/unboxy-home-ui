import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import type { Game, ChatMessage } from '../types';

interface GameDetailProps {
  gameId: string;
}

const GameDetail: React.FC<GameDetailProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isGameFocused, setIsGameFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGameData();
  }, [gameId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameFocused) {
        const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
        if (scrollKeys.includes(e.code)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    };

    // Disable scrolling on body when game is focused
    if (isGameFocused) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      // Always restore scrolling when unmounting
      document.body.style.overflow = 'auto';
    };
  }, [isGameFocused]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadGameData = async (preserveMessages: boolean = false) => {
    try {
      setLoading(!preserveMessages); // Don't show loading spinner when preserving messages
      
      // Load real game data from API
      const gameData = await gameAPI.getGame(gameId);
      setGame(gameData);

      // Only initialize chat messages if we're not preserving existing ones
      if (!preserveMessages) {
        // Initialize chat with description as first user message, followed by AI response
        const mockMessages: ChatMessage[] = [
          {
            id: '1',
            role: 'user',
            content: gameData.description,
            timestamp: gameData.createdAt
          },
          {
            id: '2',
            role: 'assistant',
            content: gameData.aiResponse || `Perfect! I've created your game "${gameData.title}" based on your description. The game is now playable in the preview area. You can continue chatting with me to modify or enhance the game further. What would you like to change or add?`,
            timestamp: gameData.createdAt
          }
        ];
        setMessages(mockMessages);

        // TODO: Load actual chat history when implemented
        // const chatHistory = await gameAPI.getChatHistory(gameId);
        // setMessages(chatHistory);
      }
      
    } catch (error: any) {
      console.error('Failed to load game data:', error);
      setError('Failed to load game data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setSending(true);

    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: 'thinking-' + Date.now().toString(),
      role: 'assistant',
      content: 'AI is thinking...',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await gameAPI.updateGameWithChat(gameId, userMessage.content);
      
      // Remove thinking message and add real response
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      // Reload game data first to get the updated metadata with AI response
      const updatedGameData = await gameAPI.getGame(gameId);
      setGame(updatedGameData);
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: updatedGameData.aiResponse || 'Game updated successfully!',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove thinking message and show error
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      setError('Failed to update game');
    } finally {
      setSending(false);
    }
  };


  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Game not found</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div>
          <button
            onClick={handleBackToProjects}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
          <p className="text-gray-600">{game.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Chat Section */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <div className="bg-gray-50 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">Chat with AI</h2>
            <p className="text-sm text-gray-600">Modify your game by chatting with the AI</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' 
                    ? 'justify-end ml-12' 
                    : 'justify-start mr-12'
                }`}
              >
                <div
                  className={`max-w-full p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-slate-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4">
            <div className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask AI to modify your game..."
                className="w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="bg-gray-50 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">Game Preview</h2>
            <p className="text-sm text-gray-600">See your game updates in real-time</p>
          </div>
          
          <div className="flex-1 p-4">
            {game.publicGameUrl ? (
              <div
                ref={gameContainerRef}
                className="w-full h-full border rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                tabIndex={0}
                onFocus={() => setIsGameFocused(true)}
                onBlur={() => setIsGameFocused(false)}
                onMouseEnter={() => setIsGameFocused(true)}
                onMouseLeave={() => setIsGameFocused(false)}
                onClick={() => {
                  setIsGameFocused(true);
                  gameContainerRef.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (isGameFocused) {
                    const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
                    if (scrollKeys.includes(e.code)) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }
                }}
              >
                <iframe
                  key={game.updatedAt} // Force iframe to reload when game is updated
                  src={`${game.publicGameUrl}${game.publicGameUrl.includes('?') ? '&' : '?'}v=${new Date(game.updatedAt).getTime()}`}
                  className="w-full h-full border-0"
                  title="Game Preview"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            ) : (
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 text-lg mb-2">🎮</div>
                  <p className="text-gray-600">Game preview will appear here</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {game.gameStatus === 'GENERATING' ? 'Game is being generated...' : 'Game will load once generation is complete'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;