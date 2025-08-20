// client/src/components/GameList.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PredictionForm from './PredictionForm';
import PredictionView from './PredictionView';
import CommunityPicks from './CommunityPicks';
import { auth } from '../firebase';
import { useCountdown } from './usePredictionLock';
import useGameStore from '../store';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const PredictionLockTimer = ({ deadline }) => {
    const { days, hours, minutes, seconds } = useCountdown(deadline);
    if (days > 0) {
        return (
            <div className="text-center mt-2">
                <p className="text-sm text-star-silver font-quantico">
                    Predictions Lock In: {days}d {hours}h {minutes}m
                </p>
            </div>
        );
    }
    return (
        <div className="text-center mt-2">
            <p className="text-sm text-goal-red font-quantico animate-pulse">
                Predictions Lock In: {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
        </div>
    );
};

const GameCard = ({ game, myPredictions, rosters, openFormId, openPicksId, toggleForm, togglePicks, isNextGame }) => {
    const existingPrediction = myPredictions[game.id];
    const isFormOpen = openFormId === game.id;
    const arePicksOpen = openPicksId === game.id;
    let scorerName = '';

    const deadline = new Date(new Date(game.startTimeUTC).getTime() + 7 * 60 * 1000);
    const isLocked = new Date() > deadline;

    if (existingPrediction) {
        const pred = existingPrediction.prediction || existingPrediction;
        const roster = rosters[pred.winningTeam];
        if (roster) {
            const scorer = roster.find(p => String(p.id) === String(pred.gwgScorer));
            if (scorer) {
                scorerName = `${scorer.firstName.default} ${scorer.lastName.default}`;
            }
        }
    }

    return (
        <div className="game-card bg-slate-gray/20 backdrop-blur-md border border-slate-gray/30 rounded-lg p-4 md:p-6">
            <div className="flex justify-center items-start gap-4 md:gap-8">
                <div className="w-[90px] text-center">
                    <div className="w-[90px] h-[90px] bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                        <img src={game.awayTeam.darkLogo} alt={game.awayTeam.placeName.default} className="h-16 w-16" />
                    </div>
                    <p className="text-sm font-bold text-ice-white truncate">{game.awayTeam.placeName.default}</p>
                </div>
                <div className="text-center pt-8">
                    <p className="text-lg md:text-xl font-bold">AT</p>
                    <p className="text-xs md:text-sm text-star-silver">{new Date(game.startTimeUTC).toLocaleDateString([], { month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs md:text-sm text-star-silver">{new Date(game.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="w-[90px] text-center">
                    <div className="w-[90px] h-[90px] bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                        <img src={game.homeTeam.darkLogo} alt={game.homeTeam.placeName.default} className="h-16 w-16" />
                    </div>
                    <p className="text-sm font-bold text-ice-white truncate">{game.homeTeam.placeName.default}</p>
                </div>
            </div>

            {isNextGame && !isLocked && <PredictionLockTimer deadline={deadline} />}
            {/* Pass the 'game' prop down to PredictionView */}
            {existingPrediction && !isFormOpen && <PredictionView prediction={existingPrediction} scorerName={scorerName} game={game} />}
            {isFormOpen && <PredictionForm game={game} userId={auth.currentUser?.uid} existingPrediction={existingPrediction} closeForm={() => toggleForm(game.id)} />}

            <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center mt-6">
                {isFormOpen ? (
                    <button onClick={() => toggleForm(game.id)} className="bg-goal-red hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors">Cancel</button>
                ) : existingPrediction ? (
                    <button onClick={() => toggleForm(game.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors" disabled={isLocked}>Edit Your Predictions</button>
                ) : (
                    <button onClick={() => toggleForm(game.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors" disabled={isLocked}>Make Your Predictions</button>
                )}
                <button onClick={() => togglePicks(game.id)} className="bg-slate-gray hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition-colors">
                    {arePicksOpen ? 'Hide All Predictions' : 'See All Predictions'}
                </button>
            </div>
            {arePicksOpen && <CommunityPicks gameId={game.id} />}
        </div>
    );
};

const GameList = () => {
    const { games, myPredictions, rosters, loading, fetchRostersForPredictions } = useGameStore();
    const [openFormId, setOpenFormId] = useState(null);
    const [openPicksId, setOpenPicksId] = useState(null);
    const container = useRef();

    useGSAP(() => {
        if (!loading && games.length > 0) {
            gsap.from(".game-card", {
                duration: 0.5,
                opacity: 0,
                y: 50,
                stagger: 0.1,
                ease: "power3.out",
            });
        }
    }, { scope: container, dependencies: [loading, games] });

    useEffect(() => {
        if (Object.keys(myPredictions).length > 0) {
            fetchRostersForPredictions();
        }
    }, [myPredictions, fetchRostersForPredictions]);

    const toggleForm = (gameId) => {
        setOpenPicksId(null);
        setOpenFormId(prevId => (prevId === gameId ? null : gameId));
    };

    const togglePicks = (gameId) => {
        setOpenFormId(null);
        setOpenPicksId(prevId => (prevId === gameId ? null : gameId));
    };

    if (loading) return <p className="text-center mt-8">Loading games...</p>;

    const nextGame = games.length > 0 ? games[0] : null;
    const upcomingGames = games.length > 1 ? games.slice(1, 5) : [];

    return (
        <div className="max-w-4xl mx-auto p-4" ref={container}>
            {nextGame && (
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-center mb-6 uppercase text-ice-white tracking-wider font-quantico">Next Game</h2>
                    <GameCard 
                        game={nextGame} 
                        myPredictions={myPredictions} 
                        rosters={rosters}
                        openFormId={openFormId}
                        openPicksId={openPicksId}
                        toggleForm={toggleForm}
                        togglePicks={togglePicks}
                        isNextGame={true}
                    />
                </section>
            )}

            {upcomingGames.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-center mb-6 uppercase text-ice-white tracking-wider font-quantico">Upcoming Games</h2>
                    <div className="space-y-6">
                        {upcomingGames.map(game => (
                            <GameCard 
                                key={game.id}
                                game={game} 
                                myPredictions={myPredictions} 
                                rosters={rosters}
                                openFormId={openFormId}
                                openPicksId={openPicksId}
                                toggleForm={toggleForm}
                                togglePicks={togglePicks}
                                isNextGame={false}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default GameList;
