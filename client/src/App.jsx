// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { AnimatePresence } from 'framer-motion';

// Import Components and Pages
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AuthPage from './pages/AuthPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import PageLayout from './components/PageLayout';
import DitherBackground from './components/DitherBackground';
import './App.css';

const ADMIN_UID = "KBEpMpQfsRhP7T4rRSrX2hbZeX83";

const AppRoutes = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="bg-union-blue min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAdmin = currentUser?.uid === ADMIN_UID;

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar user={currentUser} isAdmin={isAdmin} />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageLayout><HomePage /></PageLayout>} />
            <Route path="/leaderboard" element={<PageLayout><LeaderboardPage /></PageLayout>} />
            <Route path="/results" element={<PageLayout><ResultsPage /></PageLayout>} />
            <Route 
              path="/login" 
              element={currentUser ? <Navigate to="/" /> : <PageLayout><AuthPage /></PageLayout>} 
            />
            <Route 
              path="/admin"
              element={isAdmin ? <PageLayout><AdminPage /></PageLayout> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DitherBackground />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
