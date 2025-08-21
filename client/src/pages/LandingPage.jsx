// client/src/pages/LandingPage.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import AuthPage from './AuthPage';

const LandingPage = () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
        // If the user is logged in, redirect them to the main dashboard/home page
        return <Navigate to="/home" />;
    }

    // If the user is not logged in, show the authentication page
    return <AuthPage />;
};

export default LandingPage;
