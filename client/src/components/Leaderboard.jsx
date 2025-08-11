// client/src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
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

    if (loading) return <p className="text-center mt-8">Loading Leaderboard...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Rank</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Player</th>
                            <th className="text-right py-3 px-4 uppercase font-semibold text-sm">Score</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {leaderboardData.length > 0 ? (
                            leaderboardData.map((user, index) => (
                                <tr key={user.userId || index} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="text-left py-3 px-4">{index + 1}</td>
                                    <td className="text-left py-3 px-4">{user.email || 'Anonymous'}</td>
                                    <td className="text-right py-3 px-4 font-bold">{user.totalScore}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center py-6">
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