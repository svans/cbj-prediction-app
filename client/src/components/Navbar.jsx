// client/src/components/Navbar.jsx

import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        signOut(auth);
        setIsMenuOpen(false);
    };

    const activeLinkStyle = {
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        color: 'white',
    };

    const mobileLinkStyle = "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium";
    const mobileActiveLinkStyle = "bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium";

    return (
        <nav className="bg-union-blue shadow-lg">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon when menu is closed */}
                            {!isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                // Icon when menu is open
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <div className="flex-1 flex items-center justify-center md:items-stretch md:justify-start">
                        <div className="flex-shrink-0 flex items-center">
                             <h1 className="text-2xl font-bold text-white">CBJ Predictor</h1>
                        </div>
                        <div className="hidden md:block md:ml-6">
                            <div className="flex space-x-4">
                                <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-star-silver hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</NavLink>
                                <NavLink to="/leaderboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-star-silver hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Leaderboard</NavLink>
                                <NavLink to="/results" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-star-silver hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Results</NavLink>
                            </div>
                        </div>
                    </div>

                    {/* User Info / Logout */}
                    <div className="hidden md:flex items-center gap-4">
                         {user ? (
                            <>
                                <span className="text-sm text-star-silver">{user.email}</span>
                                <button onClick={handleLogout} className="bg-goal-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({isActive}) => isActive ? mobileActiveLinkStyle : mobileLinkStyle}>Home</NavLink>
                        <NavLink to="/leaderboard" onClick={() => setIsMenuOpen(false)} className={({isActive}) => isActive ? mobileActiveLinkStyle : mobileLinkStyle}>Leaderboard</NavLink>
                        <NavLink to="/results" onClick={() => setIsMenuOpen(false)} className={({isActive}) => isActive ? mobileActiveLinkStyle : mobileLinkStyle}>Results</NavLink>
                         {user ? (
                            <button onClick={handleLogout} className="w-full text-left bg-goal-red hover:bg-red-700 text-white font-bold px-3 py-2 rounded">
                                Logout ({user.email})
                            </button>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold block px-3 py-2 rounded">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

