// client/src/components/LeaderboardSnippet.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

const LeaderboardSnippet = () => {
    const [topPlayers, setTopPlayers] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('https://cbj-prediction-app.onrender.com/api/leaderboard');
                setTopPlayers(response.data.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch leaderboard snippet", error);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4 text-center">
            <h3 className="text-2xl font-bold uppercase text-ice-white tracking-wider mb-4 font-quantico">Top Predictors</h3>
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
                {topPlayers.map((player, index) => (
                    <div key={player.userId} className="bg-slate-gray/20 backdrop-blur-md border border-slate-gray/30 p-4 rounded-lg w-full md:w-1/3 flex flex-col justify-between">
                        <div>
                            <p className="text-lg font-bold text-star-silver">#{index + 1}</p>
                            <div className="flex items-center justify-center gap-2">
                                {index === 0 && <Crown size={20} className="text-yellow-400" />}
                                <Link to={`/profile/${player.username}`}>
                                    <p className="text-xl font-bold text-ice-white truncate hover:underline">{player.username || player.email}</p>
                                </Link>
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="inline-block bg-goal-red text-ice-white font-bold text-md px-3 py-1 rounded-md">
                                <CountUp end={player.totalScore} duration={1.5} /> pts
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardSnippet;
