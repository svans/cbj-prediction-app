import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const PredictionForm = ({ game, userId, existingPrediction, closeForm }) => {
    // State variables
    const [winningTeam, setWinningTeam] = useState('');
    const [roster, setRoster] = useState([]);
    const [gwgScorer, setGwgScorer] = useState('');
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [endCondition, setEndCondition] = useState('regulation');
    const [isEmptyNet, setIsEmptyNet] = useState(false);
    const [totalShots, setTotalShots] = useState(0);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [takenScorers, setTakenScorers] = useState([]);
    const [takenShotTotals, setTakenShotTotals] = useState([]);
    const [showAnimation, setShowAnimation] = useState(false);

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-slate-gray border border-star-silver rounded-md shadow-sm text-ice-white focus:outline-none focus:ring-2 focus:ring-goal-red";
    const labelStyle = "block text-sm font-bold text-star-silver";

    const currentPrediction = existingPrediction?.prediction || existingPrediction;

    // Pre-fill the form when editing an existing prediction
    useEffect(() => {
        if (currentPrediction) {
            const { score, winningTeam, gwgScorer, endCondition, isEmptyNet, totalShots } = currentPrediction;
            if (score && typeof score === 'string') {
                const [away, home] = score.split('-').map(Number);
                setAwayScore(away || 0);
                setHomeScore(home || 0);
            }
            setWinningTeam(winningTeam || '');
            setGwgScorer(gwgScorer || '');
            setEndCondition(endCondition || 'regulation');
            setIsEmptyNet(isEmptyNet || false);
            setTotalShots(totalShots || 0);
        }
    }, [existingPrediction]);

    // Listen for real-time updates on taken picks
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

    // Fetch the roster when a winning team is selected
    useEffect(() => {
        if (!winningTeam) {
            setRoster([]);
            return;
        }
        const fetchRoster = async () => {
            setLoadingRoster(true);
            try {
                const response = await axios.get(`https://cbj-prediction-app.onrender.com/api/roster/${winningTeam}`);
                setRoster([...response.data.forwards, ...response.data.defensemen]);
            } catch (error) {
                setMessage('Error fetching player list.');
            } finally {
                setLoadingRoster(false);
            }
        };
        fetchRoster();
    }, [winningTeam]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('Submitting...');
        const prediction = { 
            winningTeam, 
            gwgScorer, 
            score: `${awayScore}-${homeScore}`, 
            endCondition, 
            isEmptyNet,
            totalShots: Number(totalShots) 
        };
        try {
            await axios.post('https://cbj-prediction-app.onrender.com/api/predictions', {
                userId, gameId: game.id, prediction, startTimeUTC: game.startTimeUTC
            });
            setShowAnimation(true);
            setTimeout(() => {
                setShowAnimation(false);
                closeForm();
            }, 2500);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to save prediction.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show animation on successful submission
    if (showAnimation) {
        return (
            <div className="text-center p-8 animate-fade-in-down">
                <div className="puck-animation"></div>
                <p className="text-2xl font-bold text-ice-white mt-4">Prediction Saved!</p>
            </div>
        );
    }

    const isShotTotalTakenByOther = takenShotTotals.includes(Number(totalShots)) && Number(totalShots) !== currentPrediction?.totalShots;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t border-slate-gray pt-6 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelStyle}>Winning Team:</label>
                    <select value={winningTeam} onChange={(e) => setWinningTeam(e.target.value)} required className={inputStyle}>
                        <option value="" disabled>-- Select a Team --</option>
                        <option value={game.awayTeam.abbrev}>{game.awayTeam.placeName.default}</option>
                        <option value={game.homeTeam.abbrev}>{game.homeTeam.placeName.default}</option>
                    </select>
                </div>
                <div>
                    <label className={labelStyle}>Game-Winning Goal Scorer:</label>
                    <select value={gwgScorer} onChange={(e) => setGwgScorer(e.target.value)} required className={inputStyle} disabled={!roster.length}>
                        <option value="" disabled>-- Select a Player --</option>
                        {roster.map(player => {
                            const isTaken = takenScorers.includes(String(player.id));
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
                <div>
                    <label className={labelStyle}>Game Ends In:</label>
                    <select value={endCondition} onChange={(e) => setEndCondition(e.target.value)} className={inputStyle}>
                        <option value="regulation">Regulation</option>
                        <option value="overtime">Overtime</option>
                        <option value="shootout">Shootout</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className={labelStyle}>Total Shots on Goal (Both Teams):</label>
                    <input type="number" value={totalShots} onChange={(e) => setTotalShots(e.target.value)} min="0" className={inputStyle} />
                    {isShotTotalTakenByOther && <p className="text-red-500 text-sm mt-1">This shot total has already been taken.</p>}
                </div>
                <div className="md:col-span-2 flex items-center justify-center">
                    <input id="empty-net" type="checkbox" checked={isEmptyNet} onChange={(e) => setIsEmptyNet(e.target.checked)} className="h-4 w-4 text-goal-red bg-slate-gray border-star-silver rounded focus:ring-goal-red" />
                    <label htmlFor="empty-net" className="ml-2 block text-sm font-bold text-star-silver">Final Goal is Empty Net?</label>
                </div>
            </div>
            <div className="flex justify-center mt-6">
                <button type="submit" disabled={isSubmitting || !winningTeam || !gwgScorer || isShotTotalTakenByOther} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded disabled:bg-gray-400">
                    Save Your Predictions
                </button>
            </div>
            {message && <p className="mt-4 text-center">{message}</p>}
        </form>
    );
};

export default PredictionForm;
