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

    if (loading) return <p className="text-center mt-4">Loading picks...</p>;
    if (error) return <p className="text-center mt-4 text-yellow-600">{error}</p>;

    return (
        <div className="mt-6 border-t border-slate-gray pt-4">
            <h3 className="text-lg font-bold text-ice-white mb-2 text-center">Community Predictions</h3>
            {picks.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                    {picks.map((pick, index) => (
                        <div key={index} className="bg-union-blue/50 p-3 rounded-md text-sm">
                            <p className="font-semibold text-star-silver">{pick.email}</p>
                            <p className="text-ice-white">
                                Score: {pick.prediction.score}, Shots: {pick.prediction.totalShots}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center mt-4 text-gray-400">No predictions have been submitted yet.</p>
            )}
        </div>
    );
};

export default CommunityPicks;
