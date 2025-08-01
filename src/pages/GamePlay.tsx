import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameAPI } from '../services/api';
import Header from '../components/Header';
import type { Game } from '../types';

const GamePlay: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGameFocused, setIsGameFocused] = useState(false);

  useEffect(() => {
    if (gameId) {
      loadGame(gameId);
    }
  }, [gameId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

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

  const loadGame = async (id: string) => {
    try {
      setLoading(true);
      const gameData = await gameAPI.getGame(id);
      setGame(gameData);
    } catch (error) {
      console.error('Failed to load game:', error);
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToGames = () => {
    navigate('/');
  };

  const handleFullscreen = () => {
    if (isFullscreen) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } else {
      // Enter fullscreen
      if (gameContainerRef.current) {
        if (gameContainerRef.current.requestFullscreen) {
          gameContainerRef.current.requestFullscreen();
        } else if ((gameContainerRef.current as any).webkitRequestFullscreen) {
          (gameContainerRef.current as any).webkitRequestFullscreen();
        } else if ((gameContainerRef.current as any).msRequestFullscreen) {
          (gameContainerRef.current as any).msRequestFullscreen();
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-lg text-red-600 mb-4">{error || 'Game not found'}</div>
        <button
          onClick={handleBackToGames}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Back to Games
        </button>
      </div>
    );
  }

  const baseGameUrl = game.publicGameUrl || game.gameUrl;
  const gameUrl = baseGameUrl ? `${baseGameUrl}${baseGameUrl.includes('?') ? '&' : '?'}v=${new Date(game.updatedAt).getTime()}` : null;

  if (!gameUrl) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-lg text-red-600 mb-4">Game URL not available</div>
        <button
          onClick={handleBackToGames}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={handleBackToGames}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Games
          </button>
        </div>

        {/* Game iframe container */}
        <div 
          ref={gameContainerRef} 
          className="relative bg-black rounded-lg overflow-hidden border border-gray-300 focus:outline-none"
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
            ref={iframeRef}
            src={gameUrl}
            className="w-full h-[600px] border-0"
            allowFullScreen
            title={game.title}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
          {/* Fullscreen button */}
          <button
            onClick={handleFullscreen}
            className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-md transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5m4.5 0l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" 
                />
              </svg>
            )}
          </button>
        </div>

        {/* Game information */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.title}</h1>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>By {game.createdBy || game.userId}</span>
                <span>•</span>
                <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                {game.gameType && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{game.gameType}</span>
                  </>
                )}
              </div>
            </div>
            {game.gameStatus && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                game.gameStatus === 'DEPLOYED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {game.gameStatus}
              </span>
            )}
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About this game</h3>
            <p className="text-gray-700 leading-relaxed">{game.description}</p>
          </div>

          {game.tags && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {game.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GamePlay;