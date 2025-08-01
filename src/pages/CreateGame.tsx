import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gameAPI } from '../services/api';

const CreateGame: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a game');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create game via API and wait for response
      const newGame = await gameAPI.createGame(title.trim(), description.trim());
      // Navigate only after successful creation
      navigate(`/game/${newGame.id}`);
    } catch (error: any) {
      console.error('Failed to create game:', error);
      setError(error.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="text-yellow-800">
            You must be logged in to create a game. Please sign in first.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Game</h1>
        
        {loading ? (
          // Loading state with animation
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Initializing Project...</h2>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center justify-center">
                <span className="animate-pulse">⚡</span>
                <span className="ml-2">AI is generating your game</span>
              </p>
              <p className="flex items-center justify-center">
                <span className="animate-pulse">🎮</span>
                <span className="ml-2">Creating game files</span>
              </p>
              <p className="flex items-center justify-center">
                <span className="animate-pulse">🚀</span>
                <span className="ml-2">Deploying to cloud</span>
              </p>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              This may take 30-60 seconds...
            </div>
          </div>
        ) : (
          // Normal form state
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Game Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a catchy title for your game"
                maxLength={100}
                required
              />
              <p className="mt-1 text-sm text-gray-500">{title.length}/100 characters</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Game Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your game idea. What kind of game do you want to create? What should it include?"
                maxLength={500}
                required
              />
              <p className="mt-1 text-sm text-gray-500">{description.length}/500 characters</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• AI will generate your game based on your description</li>
                <li>• You'll be taken to the game development page</li>
                <li>• Chat with AI to refine and improve your game</li>
                <li>• Preview your game in real-time</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!title.trim() || !description.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-md font-medium transition-colors"
              >
                Create Game
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateGame;