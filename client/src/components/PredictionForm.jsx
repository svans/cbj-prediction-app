// client/src/components/PredictionForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ... (other imports)

const PredictionForm = ({ game, userId, existingPrediction, closeForm }) => {
    // ... (state variables remain the same) ...

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-slate-gray border border-star-silver rounded-md shadow-sm text-ice-white focus:outline-none focus:ring-2 focus:ring-goal-red";
    const labelStyle = "block text-sm font-bold text-star-silver";

    // ... (useEffect hooks remain the same) ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (submit logic) ...
        setMessage('Prediction saved successfully!');
        setTimeout(() => closeForm(), 1500); // Close form after 1.5s
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t border-slate-gray pt-6 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelStyle}>Winning Team:</label>
                    <select value={winningTeam} onChange={(e) => setWinningTeam(e.target.value)} required className={inputStyle}>
                        {/* ... options ... */}
                    </select>
                </div>
                <div>
                    <label className={labelStyle}>Game-Winning Goal Scorer:</label>
                    <select value={gwgScorer} onChange={(e) => setGwgScorer(e.target.value)} required className={inputStyle} disabled={!roster.length}>
                        {/* ... options ... */}
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
                        {/* ... options ... */}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className={labelStyle}>Total Shots on Goal (Both Teams):</label>
                    <input type="number" value={totalShots} onChange={(e) => setTotalShots(e.target.value)} min="0" className={inputStyle} />
                    {/* ... error message ... */}
                </div>
            </div>
            <div className="flex justify-center mt-6">
                <button type="submit" disabled={isSubmitting || !winningTeam || !gwgScorer} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded disabled:bg-gray-400">
                    Save Your Predictions
                </button>
            </div>
            {message && <p className="mt-4 text-center">{message}</p>}
        </form>
    );
};

export default PredictionForm;
