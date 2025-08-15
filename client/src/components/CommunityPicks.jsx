// client/src/components/CommunityPicks.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommunityPicks = ({ gameId }) => {
    const [picks, setPicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPicks = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://cbj-prediction-app.onrender.com/api/predictions/${gameId}`);
                setPicks(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load predictions.');
            } finally {
                setLoading(false);
            }
        };

        fetchPicks();
    }, [gameId]);

    if (loading) return <p className="text-center mt-4 text-star-silver">Loading picks...</p>;
    if (error) return <p className="text-center mt-4 text-goal-red">{error}</p>;

    return (
        <div className="mt-6 border-t border-slate-gray/30 pt-4">
            <h3 className="text-lg font-quantico text-ice-white mb-4 text-center">Community Predictions</h3>
            {picks.length > 0 ? (
                <div className="space-y-2 overflow-y-auto p-2">
                    {picks.map((pick, index) => (
                        <div key={index} className="bg-union-blue/50 p-3 rounded-lg text-sm">
                            <p className="font-bold text-ice-white text-center">{pick.username || 'Anonymous'}</p>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                                <div>
                                    <p className="text-xs text-star-silver">Winner</p>
                                    <p className="font-semibold text-ice-white">{pick.prediction.winningTeam}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-star-silver">Score</p>
                                    <p className="font-semibold text-ice-white">{pick.prediction.score}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-star-silver">Shots</p>
                                    <p className="font-semibold text-ice-white">{pick.prediction.totalShots}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center mt-4 text-star-silver">No predictions have been submitted yet.</p>
            )}
        </div>
    );
};

export default CommunityPicks;
