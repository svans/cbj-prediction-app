// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { AnimatePresence } from 'framer-motion';
import useGameStore from './store'; // <-- Import the store

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
import ProfilePage from './pages/ProfilePage';


const ADMIN_UID = "KBEpMpQfsRhP7T4rRSrX2hbZeX83";

const AppRoutes = () => {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchGameData = useGameStore(state => state.fetchGameData); // <-- Get the fetch action

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            fetchGameData(user?.uid); // <-- Fetch data when auth state changes
            setLoading(false);
        });
        return () => unsubscribe();
    }, [fetchGameData]);

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
                        <Route path="/profile/:username" element={<PageLayout><ProfilePage /></PageLayout>} />
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
