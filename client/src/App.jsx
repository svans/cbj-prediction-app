// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Import Components and Pages
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ResultsPage from './pages/ResultsPage';
import AuthPage from './pages/AuthPage';
import './App.css';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    // Show a loading indicator while Firebase checks the auth status
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            <Navbar user={currentUser} />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route 
                        path="/login" 
                        element={currentUser ? <Navigate to="/" /> : <AuthPage />} 
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;