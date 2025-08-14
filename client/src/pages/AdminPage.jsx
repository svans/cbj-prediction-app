// client/src/pages/AdminPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const AdminPage = () => {
    const [gameId, setGameId] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleScoreGame = async (e) => {
        e.preventDefault();
        if (!gameId) {
            setMessage('Please enter a Game ID.');
            return;
        }
        setIsLoading(true);
        setMessage('');

        try {
            // Get the current user's ID token to send for verification
            const token = await auth.currentUser.getIdToken();
            
            const response = await axios.post(
                `https://cbj-prediction-app.onrender.com/api/score-game/${gameId}`,
                { secret: "supersecret" }, // You can continue to use the simple secret for manual triggers
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(response.data);
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold text-center mb-8 uppercase text-ice-white tracking-wider">Admin Dashboard</h2>
            <div className="bg-slate-gray/20 backdrop-blur-md border border-slate-gray/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-ice-white mb-4">Manually Score Game</h3>
                <form onSubmit={handleScoreGame} className="space-y-4">
                    <div>
                        <label htmlFor="gameId" className="block text-sm font-bold text-star-silver">Game ID</label>
                        <input
                            id="gameId"
                            type="text"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            placeholder="e.g., 2023020488"
                            className="mt-1 block w-full px-3 py-2 bg-slate-gray border border-star-silver rounded-md shadow-sm text-ice-white focus:outline-none focus:ring-2 focus:ring-goal-red"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-goal-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? 'Scoring...' : 'Run Scoring Script'}
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-ice-white">{message}</p>}
            </div>
        </div>
    );
};

export default AdminPage;
