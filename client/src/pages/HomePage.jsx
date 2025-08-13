// client/src/pages/HomePage.jsx
import React from 'react';
import GameList from '../components/GameList';
import LeaderboardSnippet from '../components/LeaderboardSnippet'; // Import the new component
import { auth } from '../firebase';

const HomePage = () => {
    const currentUser = auth.currentUser;

    return (
        <div className="p-4 md:p-8">
            {currentUser && <LeaderboardSnippet />}
            <GameList />
        </div>
    );
};

export default HomePage;