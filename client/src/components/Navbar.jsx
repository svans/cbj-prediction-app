// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { User, LogOut } from 'lucide-react'; // Import icons for a cleaner look

const Navbar = ({ user, isAdmin }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        signOut(auth);
        setIsMenuOpen(false);
    };

    // Use classes for active/inactive states for cleaner JSX
    const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300";
    const activeNavLinkClasses = "bg-union-blue text-white";
    const inactiveNavLinkClasses = "text-star-silver hover:bg-slate-gray/50 hover:text-white";

    return (
        <nav className="bg-slate-gray/20 backdrop-blur-md border-b border-slate-gray/30">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-ice-white font-quantico">CBJ PREDICTOR</Link>
                        <div className="hidden md:flex ml-10 space-x-1">
                            <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Home</NavLink>
                            <NavLink to="/leaderboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Leaderboard</NavLink>
                            <NavLink to="/results" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Results</NavLink>
                            {isAdmin && (
                                <NavLink to="/admin" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Admin</NavLink>
                            )}
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 text-sm text-star-silver">
                                    <User size={16} />
                                    <span>{user.displayName || user.email}</span>
                                </div>
                                <button onClick={handleLogout} className="flex items-center gap-2 bg-goal-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
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
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} block ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Home</NavLink>
                        <NavLink to="/leaderboard" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} block ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Leaderboard</NavLink>
                        <NavLink to="/results" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} block ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Results</NavLink>
                        {isAdmin && (
                            <NavLink to="/admin" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${navLinkClasses} block ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}>Admin</NavLink>
                        )}
                        {user ? (
                            <button onClick={handleLogout} className="w-full text-left bg-goal-red hover:bg-red-700 text-white font-bold px-3 py-2 rounded mt-2">Logout</button>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold block px-3 py-2 rounded mt-2">Login</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
