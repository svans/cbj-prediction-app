// client/src/components/GameList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PredictionForm from './PredictionForm';
import { auth } from '../firebase';

const GameList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFormId, setOpenFormId] = useState(null);
    const [myPredictions, setMyPredictions] = useState({}); // <-- State for user's predictions

    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchGameData = async () => {
            if (!userId) {
                // If user is not logged in, just fetch the schedule
                const scheduleRes = await axios.get('http://localhost:3001/api/schedule');
                setGames(scheduleRes.data.games);
                setLoading(false);
                return;
            }

            // If user is logged in, fetch both schedule and their predictions
            try {
                const [scheduleRes, predictionsRes] = await Promise.all([
                    axios.get('http://localhost:3001/api/schedule'),
                    axios.get(`http://localhost:3001/api/my-predictions/${userId}`)
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
    }, [userId]); // Re-run when the user logs in or out

    const toggleForm = (gameId) => {
        setOpenFormId(prevId => (prevId === gameId ? null : gameId));
    };

    if (loading) return <p className="text-center mt-8">Loading games...</p>;

    return (
        <div className="space-y-4">
            {games.map(game => {
                const deadline = new Date(new Date(game.startTimeUTC).getTime() + 7 * 60 * 1000);
                const isLocked = new Date() > deadline;
                const existingPrediction = myPredictions[game.id];
                const isFormOpen = openFormId === game.id;

                let button;
                if (isLocked) {
                    button = <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed" disabled>Locked</button>;
                } else if (isFormOpen) {
                    button = <button onClick={() => toggleForm(game.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Cancel</button>;
                } else if (existingPrediction) {
                    button = <button onClick={() => toggleForm(game.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Edit Prediction</button>;
                } else {
                    button = <button onClick={() => toggleForm(game.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Make Prediction</button>;
                }

                return (
                    <div key={game.id} className="bg-white shadow-md rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-xl font-bold">{game.awayTeam.placeName.default} @ {game.homeTeam.placeName.default}</h4>
                                <p className="text-gray-600">{new Date(game.startTimeUTC).toLocaleString()}</p>
                            </div>
                            {button}
                        </div>
                        {isFormOpen && (
                            <div className="mt-4 border-t pt-4">
                                <PredictionForm game={game} userId={userId} existingPrediction={existingPrediction} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GameList;
