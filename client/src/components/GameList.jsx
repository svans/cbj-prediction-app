// client/src/components/GameList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PredictionForm from './PredictionForm';
import CommunityPicks from './CommunityPicks';
import { auth } from '../firebase';

const GameList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFormId, setOpenFormId] = useState(null);
    const [openPicksId, setOpenPicksId] = useState(null);
    const [myPredictions, setMyPredictions] = useState({});
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchGameData = async () => {
            if (!userId) {
                const scheduleRes = await axios.get('https://cbj-prediction-app.onrender.com/api/schedule');
                setGames(scheduleRes.data.games);
                setLoading(false);
                return;
            }
            try {
                const [scheduleRes, predictionsRes] = await Promise.all([
                    axios.get('https://cbj-prediction-app.onrender.com/api/schedule'),
                    axios.get(`https://cbj-prediction-app.onrender.com/api/my-predictions/${userId}`)
                ]);
                setGames(scheduleRes.data.games);
                setMyPredictions(predictionsRes.data);
            } catch (error) {
                console.error("Error fetching game data!", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGameData();
    }, [userId]);

    const toggleForm = (gameId) => {
        setOpenPicksId(null);
        setOpenFormId(prevId => (prevId === gameId ? null : gameId));
    };

    const togglePicks = (gameId) => {
        setOpenFormId(null);
        // --- THIS LINE IS NOW FIXED ---
        setOpenPicksId(prevId => (prevId === gameId ? null : gameId));
    };

    if (loading) return <p className="text-center mt-8">Loading games...</p>;

    return (
        <div className="space-y-4 p-4 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Upcoming Games</h2>
            {games.map(game => {
                const deadline = new Date(new Date(game.startTimeUTC).getTime() + 7 * 60 * 1000);
                const isLocked = new Date() > deadline;
                const existingPrediction = myPredictions[game.id];
                const isFormOpen = openFormId === game.id;
                const arePicksOpen = openPicksId === game.id;

                return (
                    <div key={game.id} className="bg-white shadow-lg rounded-lg p-4 transition-shadow hover-shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="text-center md:text-left">
                                <h4 className="text-xl font-bold text-union-blue">{game.awayTeam.placeName.default} @ {game.homeTeam.placeName.default}</h4>
                                <p className="text-gray-600">{new Date(game.startTimeUTC).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={() => togglePicks(game.id)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors">
                                    {arePicksOpen ? 'Hide' : 'Picks'}
                                </button>
                                
                                {!isLocked && (
                                    isFormOpen ? (
                                        <button onClick={() => toggleForm(game.id)} className="flex-1 bg-goal-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">Cancel</button>
                                    ) : existingPrediction ? (
                                        <button onClick={() => toggleForm(game.id)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors">Edit</button>
                                    ) : (
                                        <button onClick={() => toggleForm(game.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Predict</button>
                                    )
                                )}
                                {isLocked && <div className="flex-1 text-center bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed">Locked</div>}
                            </div>
                        </div>
                        {isFormOpen && (
                            <div className="mt-4 border-t pt-4 animate-fade-in-down">
                                <PredictionForm game={game} userId={userId} existingPrediction={existingPrediction} />
                            </div>
                        )}
                        {arePicksOpen && (
                            <div className="mt-4 border-t pt-4 animate-fade-in-down">
                                <CommunityPicks gameId={game.id} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GameList;
