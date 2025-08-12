// client/src/components/PredictionView.jsx
import React from 'react';

const PredictionView = ({ prediction }) => {
    const pred = prediction.prediction || prediction;
    
    return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-ice-white mt-4">
            <div>
                <p className="font-bold text-star-silver">Winning Team:</p>
                <p>{pred.winningTeam}</p>
            </div>
            <div>
                <p className="font-bold text-star-silver">Game Winning Goal Scorer:</p>
                <p>{/* We need to fetch the scorer's name, for now show ID */ pred.gwgScorer}</p>
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
                <p className="font-bold text-star-silver">Total Shots On Goal:</p>
                <p>{pred.totalShots}</p>
            </div>
        </div>
    );
};

export default PredictionView;