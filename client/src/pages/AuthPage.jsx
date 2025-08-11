// client/src/pages/AuthPage.jsx
import React from 'react';
import Auth from '../components/Auth';

const AuthPage = () => {
    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Auth />
            </div>
        </div>
    );
};

export default AuthPage;