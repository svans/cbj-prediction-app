// client/src/components/Navbar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = ({ user }) => {
    const handleLogout = () => {
        signOut(auth);
    };

    const activeLinkStyle = {
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        color: 'white',
    };

    return (
        <nav className="flex justify-between items-center p-4 bg-union-blue text-star-silver shadow-lg">
            <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold text-white">CBJ Predictor</h1>
                <div className="flex items-center gap-4">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-white transition-colors">Home</NavLink>
                    <NavLink to="/leaderboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-white transition-colors">Leaderboard</NavLink>
                    <NavLink to="/results" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-white transition-colors">Results</NavLink>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-sm">{user.email}</span>
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
        </nav>
    );
};

export default Navbar;
