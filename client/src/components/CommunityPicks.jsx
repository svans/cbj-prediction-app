// client/src/components/CommunityPicks.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommunityPicks = ({ gameId }) => {
    const [picks, setPicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPicks = async () => {
            try {
                // The start time is no longer needed
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
        <div className="mt-4">
            <h3 className="text-lg font-bold text-union-blue mb-2">Community Predictions</h3>
            {picks.length > 0 ? (
                <div className="space-y-2">
                    {picks.map((pick, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md text-sm">
                            <p className="font-semibold">{pick.email}</p>
                            <p className="text-gray-700">
                                Predicted Score: {pick.prediction.score}, Shots: {pick.prediction.totalShots}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center mt-4 text-gray-500">No predictions have been submitted yet.</p>
            )}
        </div>
    );
};

export default CommunityPicks;
