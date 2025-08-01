import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gameAPI } from '../services/api';
import Header from '../components/Header';
import type { Game } from '../types';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Array of dark background colors (same as GamesList and UserAvatar)
  const darkColors = [
    'bg-slate-700',
    'bg-gray-700',
    'bg-zinc-700',
    'bg-neutral-700',
    'bg-stone-700',
    'bg-red-700',
    'bg-orange-700',
    'bg-amber-700',
    'bg-yellow-700',
    'bg-lime-700',
    'bg-green-700',
    'bg-emerald-700',
    'bg-teal-700',
    'bg-cyan-700',
    'bg-sky-700',
    'bg-blue-700',
    'bg-indigo-700',
    'bg-violet-700',
    'bg-purple-700',
    'bg-fuchsia-700',
    'bg-pink-700',
    'bg-rose-700'
  ];

  // Function to get consistent color for a game based on its ID
  const getColorForGame = (gameId: string): string => {
    let hash = 0;
    for (let i = 0; i < gameId.length; i++) {
      const char = gameId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % darkColors.length;
    return darkColors[index];
  };

  useEffect(() => {
    loadUserGames();
  }, [user]);

  const loadUserGames = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const response = await gameAPI.getAllGames();
      // Filter games created by current user
      const userGames = response.items.filter(game => 
        game.userId === user.id || game.createdBy === user.username
      );
      setGames(userGames);
    } catch (error) {
      console.error('Failed to load user games:', error);
      setError('Failed to load your games');
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (game: Game) => {
    navigate(`/game/${game.id}`);
  };

  const handleCreateNewGame = () => {
    navigate('/create');
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Please sign in to view your projects</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading your games...</div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">Games you've created</p>
          </div>
          <button
            onClick={handleCreateNewGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Create New Game
          </button>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">You haven't created any games yet</div>
            <button
              onClick={handleCreateNewGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Create Your First Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => handleGameClick(game)}
              >
                {game.posterUrl ? (
                  <>
                    <div className="w-full h-48 bg-gray-200">
                      <img
                        src={game.posterUrl}
                        alt={`${game.title} poster`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {game.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {game.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {game.gameStatus || 'COMPLETED'}
                        </span>
                        <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-full h-48 ${getColorForGame(game.id)} flex items-center justify-center`}>
                      <h3 className="text-2xl font-bold text-white text-center px-4">
                        {game.title}
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {game.gameStatus || 'COMPLETED'}
                        </span>
                        <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;