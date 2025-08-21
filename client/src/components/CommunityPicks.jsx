// client/src/components/CommunityPicks.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const CommunityPicks = ({ gameId }) => {
    const [picks, setPicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const container = useRef();

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

    useGSAP(() => {
        if (!loading && picks.length > 0) {
            gsap.from(".pick-item", {
                duration: 0.5,
                opacity: 0,
                x: -20,
                stagger: 0.05,
                ease: "power3.out",
            });
        }
    }, { scope: container, dependencies: [loading, picks] });

    if (loading) return <p className="text-center mt-4 text-star-silver">Loading picks...</p>;
    if (error) return <p className="text-center mt-4 text-goal-red">{error}</p>;

    return (
        <div className="mt-4 border-t border-slate-gray/30 pt-4" ref={container}>
            <h3 className="text-lg font-quantico text-ice-white mb-2 text-center">Community Predictions</h3>
            {picks.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                    {picks.map((pick, index) => (
                        <div key={index} className="pick-item bg-union-blue/50 p-2 rounded-lg text-xs flex flex-col justify-center items-center">
                            <p className="font-bold text-ice-white">{pick.username || 'Anonymous'}</p>
                            <div className="flex justify-around items-center font-mono text-star-silver w-full mt-1">
                                <span>Winner: <span className="font-semibold text-ice-white">{pick.prediction.winningTeam}</span></span>
                                <span>Score: <span className="font-semibold text-ice-white">{pick.prediction.score}</span></span>
                                <span>Shots: <span className="font-semibold text-ice-white">{pick.prediction.totalShots}</span></span>
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
