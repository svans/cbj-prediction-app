// client/src/components/PredictionView.jsx
import React from 'react';

const StatCard = ({ label, value }) => (
    <div className="bg-union-blue/50 rounded-lg p-3 text-center h-full flex flex-col justify-center">
        <p className="text-xs font-bold text-star-silver uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-ice-white mt-1 truncate">{value}</p>
    </div>
);

const PredictionView = ({ prediction, scorerName, game }) => {
    const pred = prediction.prediction || prediction;
    
    if (!game) {
        return <p className="text-center text-star-silver mt-4">Loading game details...</p>;
    }

    const winningTeamData = game.homeTeam.abbrev === pred.winningTeam 
        ? game.homeTeam 
        : game.awayTeam;

    return (
        <div className="space-y-4 mt-4 pt-4 border-t border-slate-gray/30">
            {/* --- Hero section for the winning team pick --- */}
            <div className="text-center">
                <p className="font-bold text-star-silver mb-2">Your Pick to Win:</p>
                <div className="bg-slate-800/50 rounded-lg p-4 inline-flex flex-col items-center gap-2">
                    <img src={winningTeamData.darkLogo} alt={winningTeamData.placeName.default} className="h-16 w-16" />
                    <p className="font-bold text-ice-white">{winningTeamData.placeName.default}</p>
                </div>
            </div>

            {/* --- Updated stat grid for a cleaner, centered layout --- */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <StatCard label="GWG Scorer" value={scorerName || `ID: ${pred.gwgScorer}`} />
                <StatCard label="Final Score" value={pred.score} />
                <StatCard label="Game Ends In" value={<span className="capitalize">{pred.endCondition.replace('-', ' ')}</span>} />
                <StatCard label="Total Shots" value={pred.totalShots} />
                {/* This card now spans both columns to center it */}
                <div className="col-span-2">
                    <StatCard label="Empty Net Goal" value={pred.isEmptyNet ? 'Yes' : 'No'} />
                </div>
            </div>
        </div>
    );
};

export default PredictionView;
