// client/src/components/PredictionForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const PredictionForm = ({ game, userId, existingPrediction }) => {
    // State variables
    const [winningTeam, setWinningTeam] = useState('');
    const [roster, setRoster] = useState([]);
    const [gwgScorer, setGwgScorer] = useState('');
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [endCondition, setEndCondition] = useState('regulation');
    const [totalShots, setTotalShots] = useState(0);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [takenScorers, setTakenScorers] = useState([]);
    const [takenShotTotals, setTakenShotTotals] = useState([]);

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-200";
    const labelStyle = "block text-sm font-medium text-gray-700";

    // --- NEW: Safely get the current prediction data ---
    const currentPrediction = existingPrediction?.prediction || existingPrediction;

    // useEffect to pre-fill the form for editing
    useEffect(() => {
        if (currentPrediction) {
            if (currentPrediction.score && typeof currentPrediction.score === 'string') {
                const [away, home] = currentPrediction.score.split('-').map(Number);
                setAwayScore(away || 0);
                setHomeScore(home || 0);
            }
            setWinningTeam(currentPrediction.winningTeam || '');
            setGwgScorer(currentPrediction.gwgScorer || '');
            setEndCondition(currentPrediction.endCondition || 'regulation');
            setTotalShots(currentPrediction.totalShots || 0);
        }
    }, [currentPrediction]); // Depend on the safe variable

    // Real-time listener for taken picks
    useEffect(() => {
        const db = getFirestore();
        const gamePicksRef = doc(db, "gamePicks", String(game.id));
        const unsubscribe = onSnapshot(gamePicksRef, (doc) => {
            const data = doc.data();
            setTakenScorers(data?.takenGwgScorers || []);
            setTakenShotTotals(data?.takenShotTotals || []);
        });
        return () => unsubscribe();
    }, [game.id]);

    // Fetch roster when winning team is selected
    useEffect(() => {
        if (!winningTeam) {
            setRoster([]);
            return;
        }
        const fetchRoster = async () => {
            setLoadingRoster(true);
            try {
                const response = await axios.get(`http://localhost:3001/api/roster/${winningTeam}`);
                setRoster([...response.data.forwards, ...response.data.defensemen]);
            } catch (error) {
                setMessage('Error fetching player list.');
            } finally {
                setLoadingRoster(false);
            }
        };
        fetchRoster();
    }, [winningTeam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('Submitting your prediction...');
        const prediction = { winningTeam, gwgScorer, score: `${awayScore}-${homeScore}`, endCondition, totalShots: Number(totalShots) };
        try {
            await axios.post('http://localhost:3001/api/predictions', {
                userId,
                gameId: game.id,
                prediction,
                startTimeUTC: game.startTimeUTC
            });
            setMessage('Prediction updated successfully!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save prediction.';
            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use the safe 'currentPrediction' variable here
    const isShotsTaken = takenShotTotals.includes(Number(totalShots)) && Number(totalShots) !== currentPrediction?.totalShots;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Winning Team Dropdown */}
            <div>
                <label className={labelStyle}>Winning Team:</label>
                <select value={winningTeam} onChange={(e) => setWinningTeam(e.target.value)} required className={inputStyle}>
                    <option value="" disabled>-- Select a Team --</option>
                    <option value={game.awayTeam.abbrev}>{game.awayTeam.placeName.default}</option>
                    <option value={game.homeTeam.abbrev}>{game.homeTeam.placeName.default}</option>
                </select>
            </div>

            {/* GWG Scorer Dropdown */}
            {loadingRoster && <p>Loading players...</p>}
            {roster.length > 0 && (
                <div>
                    <label className={labelStyle}>Game-Winning Goal Scorer:</label>
                    <select value={gwgScorer} onChange={(e) => setGwgScorer(e.target.value)} required className={inputStyle}>
                        <option value="" disabled>-- Select a Player --</option>
                        {roster.map(player => {
                            const isTaken = takenScorers.includes(String(player.id));
                            // Use the safe 'currentPrediction' variable here
                            const isMyPick = String(player.id) === currentPrediction?.gwgScorer;
                            const isDisabled = isTaken && !isMyPick;
                            return (
                                <option key={player.id} value={player.id} disabled={isDisabled}>
                                    {player.firstName.default} {player.lastName.default} (#{player.sweaterNumber})
                                    {isTaken && !isMyPick ? " (Taken)" : ""}
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {/* Final Score Inputs */}
            <div>
                <label className={labelStyle}>Final Score:</label>
                <div className="flex items-center gap-2 mt-1">
                    <input type="number" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} min="0" className={`${inputStyle} w-20`} />
                    <span className="font-semibold">{game.awayTeam.abbrev}</span>
                    <span>to</span>
                    <input type="number" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} min="0" className={`${inputStyle} w-20`} />
                    <span className="font-semibold">{game.homeTeam.abbrev}</span>
                </div>
            </div>

            {/* Game End Condition Dropdown */}
            <div>
                <label className={labelStyle}>Game Ends In:</label>
                <select value={endCondition} onChange={(e) => setEndCondition(e.target.value)} className={inputStyle}>
                    <option value="regulation">Regulation</option>
                    <option value="regulation-en">Regulation + Empty Net</option>
                    <option value="overtime">Overtime</option>
                    <option value="shootout">Shootout</option>
                </select>
            </div>

            {/* Total Shots Input */}
            <div>
                <label className={labelStyle}>Total Shots on Goal (Both Teams):</label>
                <input type="number" value={totalShots} onChange={(e) => setTotalShots(e.target.value)} min="0" className={inputStyle} />
                {isShotsTaken && <p className="text-red-500 text-sm mt-1">This shot total has already been taken.</p>}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting || !winningTeam || !gwgScorer || isShotsTaken} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                {isSubmitting ? 'Submitting...' : (existingPrediction ? 'Update Prediction' : 'Submit Prediction')}
            </button>
            {message && <p className="mt-4 text-center">{message}</p>}
        </form>
    );
};

export default PredictionForm;