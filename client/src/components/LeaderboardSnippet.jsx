// client/src/components/LeaderboardSnippet.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaderboardSnippet = () => {
    const [topPlayers, setTopPlayers] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('https://cbj-prediction-app.onrender.com/api/leaderboard');
                setTopPlayers(response.data.slice(0, 3)); // Get top 3
            } catch (error) {
                console.error("Failed to fetch leaderboard snippet", error);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4 text-center">
            <h3 className="text-2xl font-bold uppercase text-ice-white tracking-wider mb-4 font-quantico">Top Predictors</h3>
            {/* This div now stacks vertically on mobile and horizontally on medium screens and up */}
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
                {topPlayers.map((player, index) => (
                    // This div is now full-width on mobile and 1/3 width on medium screens and up
                    <div key={player.userId} className="bg-slate-gray/50 p-4 rounded-lg w-full md:w-1/3">
                        <p className="text-lg font-bold text-star-silver">#{index + 1}</p>
                        <p className="text-xl font-bold text-ice-white truncate">{player.username || player.email}</p>
                        <p className="text-md text-star-silver">{player.totalScore} pts</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardSnippet;
