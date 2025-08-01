import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gameAPI } from '../services/api';
import Header from '../components/Header';
import type { Game } from '../types';

const GamesList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Array of dark background colors
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
    loadGames();
  }, []);

  const loadGames = async (page: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await gameAPI.getAllGames(page, 12);
      
      if (append) {
        setGames(prevGames => [...prevGames, ...response.items]);
      } else {
        setGames(response.items);
      }
      
      setHasMore(response.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load games:', error);
      setError('Failed to load games');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreGames = () => {
    if (!loadingMore && hasMore) {
      loadGames(currentPage + 1, true);
    }
  };

  const handleGameClick = (game: Game) => {
    navigate(`/play/${game.id}`);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading games...</div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Games</h1>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No games available yet</div>
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
                        <span>By {game.createdBy || game.userId}</span>
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
                        <span>By {game.createdBy || game.userId}</span>
                        <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {games.length > 0 && hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMoreGames}
              disabled={loadingMore}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                loadingMore
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loadingMore ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                'Load More Games'
              )}
            </button>
          </div>
        )}

        {!user && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Sign in to view and create your own games!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GamesList;