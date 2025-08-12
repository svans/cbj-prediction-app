// client/src/components/GameList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PredictionForm from './PredictionForm';
import PredictionView from './PredictionView';
import CommunityPicks from './CommunityPicks';
import { auth } from '../firebase';

const GameList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openFormId, setOpenFormId] = useState(null);
    const [openPicksId, setOpenPicksId] = useState(null);
    const [myPredictions, setMyPredictions] = useState({});
    const [rosters, setRosters] = useState({}); // <-- State to hold rosters
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchGameData = async () => {
            setLoading(true);
            const scheduleUrl = 'https://cbj-prediction-app.onrender.com/api/schedule';
            const myPredictionsUrl = `https://cbj-prediction-app.onrender.com/api/my-predictions/${userId}`;

            try {
                if (userId) {
                    const [scheduleRes, predictionsRes] = await Promise.all([
                        axios.get(scheduleUrl),
                        axios.get(myPredictionsUrl)
                    ]);
                    setGames(scheduleRes.data.games);
                    setMyPredictions(predictionsRes.data);
                } else {
                    const scheduleRes = await axios.get(scheduleUrl);
                    setGames(scheduleRes.data.games);
                }
            } catch (error) {
                console.error("Error fetching game data!", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGameData();
    }, [userId]);

    // --- NEW: useEffect to fetch rosters for predicted games ---
    useEffect(() => {
        const fetchRostersForPredictions = async () => {
            const newRosters = {};
            for (const gameId in myPredictions) {
                const prediction = myPredictions[gameId];
                const predData = prediction.prediction || prediction;
                const teamAbbrev = predData.winningTeam;

                if (teamAbbrev && !rosters[teamAbbrev]) {
                    try {
                        const response = await axios.get(`https://cbj-prediction-app.onrender.com/api/roster/${teamAbbrev}`);
                        newRosters[teamAbbrev] = [...response.data.forwards, ...response.data.defensemen];
                    } catch (error) {
                        console.error(`Failed to fetch roster for ${teamAbbrev}`, error);
                    }
                }
            }
            if (Object.keys(newRosters).length > 0) {
                setRosters(prev => ({ ...prev, ...newRosters }));
            }
        };

        if (Object.keys(myPredictions).length > 0) {
            fetchRostersForPredictions();
        }
    }, [myPredictions]);


    const toggleForm = (gameId) => {
        setOpenPicksId(null);
        setOpenFormId(prevId => (prevId === gameId ? null : gameId));
    };

    const togglePicks = (gameId) => {
        setOpenFormId(null);
        setOpenPicksId(prevId => (prevId === gameId ? null : prevId));
    };

    if (loading) return <p className="text-center mt-8">Loading games...</p>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 uppercase text-ice-white tracking-wider">Upcoming Games</h2>
            <div className="space-y-6">
                {games.map(game => {
                    const existingPrediction = myPredictions[game.id];
                    const isFormOpen = openFormId === game.id;
                    const arePicksOpen = openPicksId === game.id;

                    // --- NEW: Find the scorer's name from the fetched roster ---
                    let scorerName = '';
                    if (existingPrediction) {
                        const pred = existingPrediction.prediction || existingPrediction;
                        const roster = rosters[pred.winningTeam];
                        if (roster) {
                            const scorer = roster.find(p => String(p.id) === String(pred.gwgScorer));
                            if (scorer) {
                                scorerName = `${scorer.firstName.default} ${scorer.lastName.default}`;
                            }
                        }
                    }

                    return (
                        <div key={game.id} className="bg-slate-gray/50 border border-slate-gray rounded-lg p-4 md:p-6">
                            <div className="flex justify-center items-center gap-4 md:gap-8">
                                <img src={game.awayTeam.darkLogo} alt={game.awayTeam.placeName.default} className="h-12 w-12 md:h-16 md:w-16" />
                                <div className="text-center">
                                    <p className="text-lg md:text-xl font-bold">AT</p>
                                    <p className="text-xs md:text-sm text-star-silver">{new Date(game.startTimeUTC).toLocaleDateString([], { month: 'long', day: 'numeric' })}</p>
                                    <p className="text-xs md:text-sm text-star-silver">{new Date(game.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <img src={game.homeTeam.darkLogo} alt={game.homeTeam.placeName.default} className="h-12 w-12 md:h-16 md:w-16" />
                            </div>

                            {existingPrediction && !isFormOpen && <PredictionView prediction={existingPrediction} scorerName={scorerName} />}
                            {isFormOpen && <PredictionForm game={game} userId={userId} existingPrediction={existingPrediction} closeForm={() => setOpenFormId(null)} />}

                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center mt-6">
                                {isFormOpen ? (
                                    <button onClick={() => toggleForm(game.id)} className="bg-goal-red hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors">Cancel</button>
                                ) : existingPrediction ? (
                                    <button onClick={() => toggleForm(game.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">Edit Your Predictions</button>
                                ) : (
                                    <button onClick={() => toggleForm(game.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">Make Your Predictions</button>
                                )}
                                <button onClick={() => togglePicks(game.id)} className="bg-slate-gray hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition-colors">
                                    {arePicksOpen ? 'Hide All Predictions' : 'See All Predictions'}
                                </button>
                            </div>
                            {arePicksOpen && <CommunityPicks gameId={game.id} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GameList;
