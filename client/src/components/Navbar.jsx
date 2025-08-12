// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        signOut(auth);
        setIsMenuOpen(false);
    };

    const activeLinkStyle = {
        borderBottom: '2px solid #CE1126',
        color: 'white',
    };

    return (
        <nav className="bg-slate-gray shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-ice-white">CBJ PREDICTOR</Link>
                        <div className="hidden md:flex ml-10 space-x-4">
                            <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-star-silver hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</NavLink>
                            <NavLink to="/leaderboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-star-silver hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Leaderboard</NavLink>
                            <NavLink to="/results" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-star-silver hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Results</NavLink>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-sm text-star-silver">{user.email}</span>
                                <button onClick={handleLogout} className="bg-goal-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">Logout</button>
                            </>
                        ) : (
                             <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Login</Link>
                        )}
                    </div>
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-star-silver hover:text-white focus:outline-none">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="text-star-silver hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</NavLink>
                        <NavLink to="/leaderboard" onClick={() => setIsMenuOpen(false)} className="text-star-silver hover:text-white block px-3 py-2 rounded-md text-base font-medium">Leaderboard</NavLink>
                        <NavLink to="/results" onClick={() => setIsMenuOpen(false)} className="text-star-silver hover:text-white block px-3 py-2 rounded-md text-base font-medium">Results</NavLink>
                        {user ? (
                            <button onClick={handleLogout} className="w-full text-left bg-goal-red hover:bg-red-700 text-white font-bold px-3 py-2 rounded">Logout</button>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold block px-3 py-2 rounded">Login</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;