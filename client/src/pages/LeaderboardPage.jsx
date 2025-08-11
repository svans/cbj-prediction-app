// client/src/pages/LeaderboardPage.jsx
import React from 'react';
import Leaderboard from '../components/Leaderboard';

const LeaderboardPage = () => {
    return (
        <div style={{ padding: '20px' }}>
            {/* The Leaderboard component already has its own title */}
            <Leaderboard />
        </div>
    );
};

export default LeaderboardPage;