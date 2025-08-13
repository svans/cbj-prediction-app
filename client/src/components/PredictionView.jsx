// client/src/components/PredictionView.jsx
import React from 'react';

const PredictionView = ({ prediction, scorerName }) => {
    // Safely access the nested prediction data, falling back to the root object for older data
    const pred = prediction.prediction || prediction;
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4 text-sm text-ice-white mt-4 text-center md:text-left">
            <div>
                <p className="font-bold text-star-silver">Winning Team:</p>
                <p>{pred.winningTeam}</p>
            </div>
            <div>
                <p className="font-bold text-star-silver">GWG Scorer:</p>
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
            <div>
                <p className="font-bold text-star-silver">Total Shots:</p>
                <p>{pred.totalShots}</p>
            </div>
            <div>
                <p className="font-bold text-star-silver">Empty Net Goal:</p>
                {/* Display "Yes" or "No" based on the boolean value */}
                <p>{pred.isEmptyNet ? 'Yes' : 'No'}</p>
            </div>
        </div>
    );
};

export default PredictionView;
