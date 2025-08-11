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
                const response = await axios.get('http://localhost:3001/api/results');
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
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Game Results</h2>
            <div className="space-y-4">
                {results.length > 0 ? (
                    results.map(game => (
                        <div key={game.id} className="bg-white shadow-md rounded-lg p-4">
                            <p className="text-sm text-gray-500">{new Date(game.startTimeUTC).toLocaleDateString()}</p>
                            <div className="flex justify-between items-center mt-1">
                                <div className="flex-1">
                                    <p className={`text-lg ${game.awayTeam.score > game.homeTeam.score ? 'font-bold' : ''}`}>
                                        {game.awayTeam.placeName.default}
                                    </p>
                                    <p className={`text-lg ${game.homeTeam.score > game.awayTeam.score ? 'font-bold' : ''}`}>
                                        {game.homeTeam.placeName.default}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-2xl font-mono">
                                    <p className={`p-2 rounded ${game.awayTeam.score > game.homeTeam.score ? 'bg-blue-100' : ''}`}>
                                        {game.awayTeam.score}
                                    </p>
                                    <p>-</p>
                                    <p className={`p-2 rounded ${game.homeTeam.score > game.awayTeam.score ? 'bg-blue-100' : ''}`}>
                                        {game.homeTeam.score}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No past games found for this season yet.</p>
                )}
            </div>
        </div>
    );
};

export default ResultsPage;