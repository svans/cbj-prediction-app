// client/src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase'; // Import auth to get the current user

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Corrected the axios call to use the single, correct URL
                const response = await axios.get('https://cbj-prediction-app.onrender.com/api/leaderboard');
                setLeaderboardData(response.data);
                setError('');
            } catch (err) {
                setError('Could not load the leaderboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <p className="text-center mt-8 text-ice-white">Loading Leaderboard...</p>;
    if (error) return <p className="text-center mt-8 text-goal-red">{error}</p>;

    return (
        <div className="bg-slate-gray/50 border border-slate-gray rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-ice-white text-center uppercase tracking-wider">Leaderboard</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b border-slate-gray">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-star-silver">Rank</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-star-silver">Player</th>
                            <th className="text-right py-3 px-4 uppercase font-semibold text-sm text-star-silver">Score</th>
                        </tr>
                    </thead>
                    <tbody className="text-ice-white">
                        {leaderboardData.length > 0 ? (
                            leaderboardData.map((user, index) => {
                                const isCurrentUser = user.userId === currentUser?.uid;
                                return (
                                    <tr key={user.userId || index} className={`border-b border-slate-gray/50 ${isCurrentUser ? 'bg-blue-900/50' : ''}`}>
                                        <td className="text-left py-3 px-4">{index + 1}</td>
                                        {/* Use username with a fallback to email */}
                                        <td className="text-left py-3 px-4">{user.username || user.email}</td>
                                        <td className="text-right py-3 px-4 font-bold">{user.totalScore}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center py-6 text-star-silver">
                                    No scores yet. Be the first to make a prediction!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
