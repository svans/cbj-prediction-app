// client/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Trophy, ClipboardList, BarChart2, CheckSquare } from 'lucide-react';

const StatItem = ({ icon, label, value }) => (
    <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-star-silver">
            {icon}
            <p className="font-bold">{label}</p>
        </div>
        <p className="text-ice-white mt-1">{value}</p>
    </div>
);

const ProfilePage = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`https://cbj-prediction-app.onrender.com/api/profile/${username}`);
                setProfile(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) return <p className="text-center mt-8 text-ice-white">Loading Profile...</p>;
    if (error) return <p className="text-center mt-8 text-goal-red">{error}</p>;
    if (!profile) return <p className="text-center mt-8 text-ice-white">Profile not found.</p>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-slate-gray/20 backdrop-blur-md border border-slate-gray/30 rounded-lg p-6 text-center mb-8">
                <h2 className="text-4xl font-quantico text-ice-white">{profile.user.username}</h2>
                <p className="text-2xl font-bold text-yellow-400 mt-2">{profile.user.totalScore} PTS</p>
            </div>

            <h3 className="text-2xl font-bold text-center mb-6 uppercase text-ice-white tracking-wider font-quantico">Prediction History</h3>
            <div className="space-y-6">
                {profile.predictions.map(({ prediction, game }, index) => (
                    <div key={index} className="bg-slate-gray/20 backdrop-blur-md border border-slate-gray/30 rounded-lg p-6">
                        {game ? (
                            <>
                                <div className="flex justify-center items-center gap-4 md:gap-8">
                                    <img src={game.awayTeam.darkLogo} alt={game.awayTeam.placeName.default} className="h-12 w-12" />
                                    <div className="text-center">
                                        <p className="text-sm text-star-silver">{new Date(game.startTimeUTC).toLocaleDateString()}</p>
                                        <p className="text-2xl font-mono text-ice-white">{game.awayTeam.score} - {game.homeTeam.score}</p>
                                    </div>
                                    <img src={game.homeTeam.darkLogo} alt={game.homeTeam.placeName.default} className="h-12 w-12" />
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-xl font-bold text-yellow-400">+{prediction.pointsAwarded || 0} PTS</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 text-sm mt-4 pt-4 border-t border-slate-gray/30">
                                    <StatItem icon={<Trophy size={16} />} label="Your Pick" value={prediction.prediction.winningTeam} />
                                    <StatItem icon={<ClipboardList size={16} />} label="Your Score" value={prediction.prediction.score} />
                                    <StatItem icon={<BarChart2 size={16} />} label="Your Shots" value={prediction.prediction.totalShots} />
                                    <StatItem icon={<CheckSquare size={16} />} label="Empty Net" value={prediction.prediction.isEmptyNet ? 'Yes' : 'No'} />
                                </div>
                            </>
                        ) : (
                            <p>Game data unavailable.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;
