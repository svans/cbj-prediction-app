// client/src/components/PredictionView.jsx
import React from 'react';

// The component now accepts the scorer's name as a prop
const PredictionView = ({ prediction, scorerName }) => {
    const pred = prediction.prediction || prediction;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 text-sm text-ice-white mt-4 text-center md:text-left">
            <div>
                <p className="font-bold text-star-silver">Winning Team:</p>
                <p>{pred.winningTeam}</p>
            </div>
            <div>
                <p className="font-bold text-star-silver">GWG Scorer:</p>
                {/* Display the fetched name, with a fallback */}
                <p>{scorerName || `ID: ${pred.gwgScorer}`}</p>
            </div>
            <div>
                <p className="font-bold text-star-silver">Final Score:</p>
                <p>{pred.score}</p>
            </div>
            <div>
                <p className="font-bold text-star-silver">Game Ends In:</p>
                <p className="capitalize">{pred.endCondition.replace('-', ' ')}</p>
            </div>
            <div className="col-span-1 md:col-span-2 text-center">
                <p className="font-bold text-star-silver">Total Shots On Goal:</p>
                <p>{pred.totalShots}</p>
            </div>
        </div>
    );
};

export default PredictionView;
