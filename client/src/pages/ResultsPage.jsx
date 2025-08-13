// client/src/pages/ResultsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultsPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/results','https://cbj-prediction-app.onrender.com/api/results');
                setResults(response.data.games);
            } catch (err) {
                setError('Could not load game results.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading) return <p className="text-center mt-8">Loading Results...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-ice-white uppercase tracking-wider">Game Results</h2>
            <div className="space-y-6">
                {results.length > 0 ? (
                    results.map(game => {
                        const totalShots = (game.homeTeam.sog || 0) + (game.awayTeam.sog || 0);
                        const gwgScorer = game.summary?.gameWinningGoal;
                        const scorerName = gwgScorer ? `${gwgScorer.firstName.default} ${gwgScorer.lastName.default}` : 'N/A';

                        return (
                            <div key={game.id} className="bg-slate-gray/50 border border-slate-gray rounded-lg p-6">
                                <div className="flex justify-center items-center gap-4 md:gap-8">
                                    <img src={game.awayTeam.darkLogo} alt={game.awayTeam.placeName.default} className="h-12 w-12 md:h-16 md:w-16" />
                                    <div className="text-center">
                                        <p className="text-sm text-star-silver">{new Date(game.startTimeUTC).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-4 text-2xl font-mono text-ice-white">
                                            <p className={`p-2 rounded ${game.awayTeam.score > game.homeTeam.score ? 'bg-union-blue' : ''}`}>
                                                {game.awayTeam.score}
                                            </p>
                                            <p>-</p>
                                            <p className={`p-2 rounded ${game.homeTeam.score > game.awayTeam.score ? 'bg-union-blue' : ''}`}>
                                                {game.homeTeam.score}
                                            </p>
                                        </div>
                                    </div>
                                    <img src={game.homeTeam.darkLogo} alt={game.homeTeam.placeName.default} className="h-12 w-12 md:h-16 md:w-16" />
                                </div>
                                
                                <div className="text-center mt-4 border-t border-slate-gray pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-bold text-star-silver">Game Winning Goal:</p>
                                        <p className="text-ice-white">{scorerName}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-star-silver">Total Shots on Goal:</p>
                                        <p className="text-ice-white">{totalShots}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p>No past games found for this season yet.</p>
                )}
            </div>
        </div>
    );
};

export default ResultsPage;
