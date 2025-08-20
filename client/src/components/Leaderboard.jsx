// client/src/components/Leaderboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Crown } from 'lucide-react';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const currentUser = auth.currentUser;
    const container = useRef();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('https://cbj-prediction-app.onrender.com/api/leaderboard');
                setLeaderboardData(response.data);
            } catch (err) {
                setError('Could not load the leaderboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    useGSAP(() => {
        if (!loading && leaderboardData.length > 0) {
            gsap.from(".leaderboard-item", {
                duration: 1.5,
                ease: "steps(3)",
            });
        }
    }, { scope: container, dependencies: [loading, leaderboardData] });


    if (loading) return <p className="text-center mt-8 text-ice-white">Loading Leaderboard...</p>;
    if (error) return <p className="text-center mt-8 text-goal-red">{error}</p>;

    const topThree = leaderboardData.slice(0, 3);
    const restOfPlayers = leaderboardData.slice(3);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8" ref={container}>
            <h2 className="text-3xl font-bold text-center mb-8 uppercase text-ice-white tracking-wider font-quantico">Leaderboard</h2>
            
            {/* Podium for Top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {topThree.map((user, index) => (
                    <div key={user.userId} className={`leaderboard-item bg-slate-gray/20 backdrop-blur-md border border-slate-gray/30 rounded-lg p-4 text-center flex flex-col ${index === 0 ? 'md:order-2' : (index === 1 ? 'md:order-1' : 'md:order-3')}`}>
                        <div className="flex-grow">
                            <div className="flex items-center justify-center gap-2">
                                {index === 0 && <Crown size={24} className="text-yellow-400" />}
                                <Link to={`/profile/${user.username}`}>
                                    <p className="text-2xl font-bold text-ice-white truncate hover:underline">{user.username || user.email}</p>
                                </Link>
                            </div>
                            <p className="text-lg font-semibold text-star-silver">#{index + 1}</p>
                        </div>
                        <p className="text-3xl font-bold text-yellow-400 mt-2">
                            <CountUp end={user.totalScore} duration={1.5} /> pts
                        </p>
                    </div>
                ))}
            </div>

            {/* List for the rest of the players */}
            <div className="space-y-2">
                {restOfPlayers.map((user, index) => {
                    const isCurrentUser = user.userId === currentUser?.uid;
                    return (
                        <div key={user.userId} className={`leaderboard-item bg-slate-gray/20 backdrop-blur-md border border-slate-gray/30 rounded-lg p-3 flex items-center justify-between ${isCurrentUser ? 'bg-blue-900/50' : ''}`}>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-star-silver w-8 text-center">{index + 4}</span>
                                <Link to={`/profile/${user.username}`}>
                                    <span className="font-semibold text-ice-white hover:underline">{user.username || user.email}</span>
                                </Link>
                            </div>
                            <p className="font-bold text-ice-white">
                                <CountUp end={user.totalScore} duration={1} /> pts
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Leaderboard;
