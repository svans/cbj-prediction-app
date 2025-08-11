// client/src/pages/HomePage.jsx
import React from 'react';
import GameList from '../components/GameList';
import { auth } from '../firebase';

const HomePage = () => {
    const currentUser = auth.currentUser;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Upcoming Games</h2>
            {currentUser ? <GameList /> : <p>Please sign in to make predictions.</p>}
        </div>
    );
};

export default HomePage;