// client/src/pages/AuthPage.jsx
import React from 'react';
import Auth from '../components/Auth';

const AuthPage = () => {
    return (
        <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Add the CBJ logo here */}
                <div>
                    <img
                        className="mx-auto h-24 w-auto"
                        src="https://assets.nhle.com/logos/nhl/svg/CBJ_light.svg"
                        alt="Columbus Blue Jackets Logo"
                    />
                </div>
                <Auth />
            </div>
        </div>
    );
};

export default AuthPage;
