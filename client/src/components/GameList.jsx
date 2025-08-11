// client/src/components/GameList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PredictionForm from './PredictionForm';
import CommunityPicks from './CommunityPicks'; // <-- Import the new component
import { auth } from '../firebase';

const GameList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFormId, setOpenFormId] = useState(null);
    const [openPicksId, setOpenPicksId] = useState(null); // <-- State to show/hide picks
    const [myPredictions, setMyPredictions] = useState({});
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        // ... (fetchGameData logic remains the same) ...
    }, [userId]);

    const toggleForm = (gameId) => {
        setOpenPicksId(null); // Close picks when opening form
        setOpenFormId(prevId => (prevId === gameId ? null : gameId));
    };

    const togglePicks = (gameId) => {
        setOpenFormId(null); // Close form when opening picks
        setOpenPicksId(prevId => (prevId === gameId ? null : prevId));
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
                    <div key={game.id} className="bg-white shadow-lg rounded-lg p-4 transition-shadow hover:shadow-xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-xl font-bold text-union-blue">{game.awayTeam.placeName.default} @ {game.homeTeam.placeName.default}</h4>
                                <p className="text-gray-600">{new Date(game.startTimeUTC).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                {/* Always show the View Picks button */}
                                <button onClick={() => togglePicks(game.id)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors">
                                    {arePicksOpen ? 'Hide Picks' : 'View Picks'}
                                </button>
                                
                                {!isLocked && (
                                    isFormOpen ? (
                                        <button onClick={() => toggleForm(game.id)} className="bg-goal-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">Cancel</button>
                                    ) : existingPrediction ? (
                                        <button onClick={() => toggleForm(game.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors">Edit Prediction</button>
                                    ) : (
                                        <button onClick={() => toggleForm(game.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Make Prediction</button>
                                    )
                                )}
                                {isLocked && <div className="bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed">Locked</div>}
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
