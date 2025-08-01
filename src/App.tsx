import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import GamesList from './pages/GamesList';
import CreateGame from './pages/CreateGame';
import GameDetail from './pages/GameDetail';
import GamePlay from './pages/GamePlay';
import Projects from './pages/Projects';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<GamesList />} />
      <Route path="/games" element={<Navigate to="/" replace />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/game/:gameId" element={<GameDetailWrapper />} />
      <Route path="/play/:gameId" element={<GamePlay />} />
      <Route path="*" element={
        <Layout>
          <Routes>
            <Route path="/create" element={<CreateGame />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}

const GameDetailWrapper: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  
  if (!gameId) {
    return <Navigate to="/" replace />;
  }
  
  return <GameDetail gameId={gameId} />;
};

export default App;
