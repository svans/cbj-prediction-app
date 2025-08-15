// client/src/components/PredictionView.jsx
import React from 'react';

const StatCard = ({ label, value }) => (
    <div className="bg-union-blue/50 rounded-lg p-3 text-center">
        <p className="text-xs font-bold text-star-silver uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-ice-white mt-1">{value}</p>
    </div>
);

const PredictionView = ({ prediction, scorerName }) => {
    // Safely access the nested prediction data, falling back to the root object for older data
    const pred = prediction.prediction || prediction;
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-4 pt-4 border-t border-slate-gray/30">
            <StatCard label="Winning Team" value={pred.winningTeam} />
            <StatCard label="GWG Scorer" value={scorerName || `ID: ${pred.gwgScorer}`} />
            <StatCard label="Final Score" value={pred.score} />
            <StatCard label="Game Ends In" value={<span className="capitalize">{pred.endCondition.replace('-', ' ')}</span>} />
            <StatCard label="Total Shots" value={pred.totalShots} />
            <StatCard label="Empty Net Goal" value={pred.isEmptyNet ? 'Yes' : 'No'} />
        </div>
    );
};

export default PredictionView;
