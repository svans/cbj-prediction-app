// client/src/components/PredictionView.jsx
import React from 'react';
import { Trophy, User, ClipboardList, Clock, BarChart2, CheckSquare } from 'lucide-react';

const StatItem = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
            {icon}
            <p className="font-bold text-star-silver">{label}:</p>
        </div>
        <p className="text-ice-white mt-1">{value}</p>
    </div>
);

const PredictionView = ({ prediction, scorerName }) => {
    const pred = prediction.prediction || prediction;
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 text-sm mt-4 pt-4 border-t border-slate-gray">
            <StatItem icon={<Trophy size={16} className="text-yellow-400" />} label="Winner" value={pred.winningTeam} />
            <StatItem icon={<User size={16} className="text-blue-400" />} label="GWG Scorer" value={scorerName || `ID: ${pred.gwgScorer}`} />
            <StatItem icon={<ClipboardList size={16} className="text-green-400" />} label="Score" value={pred.score} />
            <StatItem icon={<Clock size={16} className="text-purple-400" />} label="Ends In" value={<span className="capitalize">{pred.endCondition.replace('-', ' ')}</span>} />
            <StatItem icon={<BarChart2 size={16} className="text-orange-400" />} label="Total Shots" value={pred.totalShots} />
            <StatItem icon={<CheckSquare size={16} className="text-red-400" />} label="Empty Net" value={pred.isEmptyNet ? 'Yes' : 'No'} />
        </div>
    );
};

export default PredictionView;
