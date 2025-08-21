// client/src/components/PredictionForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { ChevronDown } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// --- Reusable Components for a Consistent Form UI ---

const TeamSelector = ({ game, selectedTeam, onSelect }) => (
    <div className="flex justify-center gap-4">
        <div 
            className={`flex flex-col items-center gap-2 cursor-pointer p-2 rounded-lg transition-all duration-300 ${selectedTeam === game.awayTeam.abbrev ? 'bg-goal-red/80 ring-2 ring-ice-white' : 'opacity-60 hover:opacity-100'}`}
            onClick={() => onSelect(game.awayTeam.abbrev)}
        >
            <img src={game.awayTeam.darkLogo} alt={game.awayTeam.placeName.default} className="h-16 w-16" />
            <p className="font-bold text-ice-white">{game.awayTeam.placeName.default}</p>
        </div>
        <div 
            className={`flex flex-col items-center gap-2 cursor-pointer p-2 rounded-lg transition-all duration-300 ${selectedTeam === game.homeTeam.abbrev ? 'bg-goal-red/80 ring-2 ring-ice-white' : 'opacity-60 hover:opacity-100'}`}
            onClick={() => onSelect(game.homeTeam.abbrev)}
        >
            <img src={game.homeTeam.darkLogo} alt={game.homeTeam.placeName.default} className="h-16 w-16" />
            <p className="font-bold text-ice-white">{game.homeTeam.placeName.default}</p>
        </div>
    </div>
);

const StyledNumberInput = ({ value, onChange, teamAbbrev }) => (
    <div className="flex items-center gap-2">
        <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value, 10))} 
            min="0" 
            className="w-20 h-12 text-center bg-slate-gray/50 border border-slate-gray/50 rounded-md shadow-sm text-ice-white focus:outline-none focus:ring-2 focus:ring-goal-red [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="font-semibold text-star-silver">{teamAbbrev}</span>
    </div>
);

const PlayerSelector = ({ roster, selectedPlayer, onSelect, takenScorers, currentPick, disabled, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedPlayerData = roster.find(p => String(p.id) === String(selectedPlayer));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button type="button" className="w-full h-12 px-3 py-2 bg-slate-gray/50 border border-slate-gray/50 rounded-md shadow-sm text-ice-white flex justify-between items-center disabled:opacity-50" onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled}>
                {selectedPlayerData ? (
                    <div className="flex items-center gap-2">
                        <img src={selectedPlayerData.headshot} alt="" className="h-8 w-8 rounded-full" />
                        <span>{selectedPlayerData.firstName.default} {selectedPlayerData.lastName.default}</span>
                    </div>
                ) : (
                    <span className="text-star-silver">{loading ? 'Loading...' : '-- Select a Player --'}</span>
                )}
                <ChevronDown size={16} className="text-star-silver" />
            </button>
            {isOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-slate-gray border border-star-silver rounded-md shadow-lg max-h-60 overflow-auto">
                    {roster.map(player => {
                        const isTaken = takenScorers.includes(String(player.id));
                        const isMyPick = String(player.id) === String(currentPick);
                        const isDisabled = isTaken && !isMyPick;
                        return (
                            <li key={player.id} className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-union-blue ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => { if (!isDisabled) { onSelect(String(player.id)); setIsOpen(false); } }}>
                                <img src={player.headshot} alt="" className="h-8 w-8 rounded-full" />
                                <span>{player.firstName.default} {player.lastName.default} (#{player.sweaterNumber})</span>
                                {isTaken && !isMyPick && <span className="text-xs text-goal-red ml-auto">(Taken)</span>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

const StyledSelect = ({ value, onChange, children }) => (
    <div className="relative">
        <select value={value} onChange={onChange} className="w-full h-12 px-3 py-2 bg-slate-gray/50 border border-slate-gray/50 rounded-md shadow-sm text-ice-white focus:outline-none focus:ring-2 focus:ring-goal-red appearance-none">
            {children}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-star-silver pointer-events-none" />
    </div>
);

const CelebrationGif = ({ winningTeam }) => {
    const cbjWinGif = 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/2351334/chippendale.0.gif';
    const cbjLoseGif = 'https://i.pinimg.com/originals/34/69/56/346956d4f4c66cddab696870b0ad4e9c.gif';
    const gifSrc = winningTeam === 'CBJ' ? cbjWinGif : cbjLoseGif;
    return <img src={gifSrc} alt="Celebration Gif" className="h-48 rounded-lg shadow-lg mb-4" />;
};


const PredictionForm = ({ game, userId, existingPrediction, closeForm }) => {
    // State variables
    const [winningTeam, setWinningTeam] = useState('');
    const [roster, setRoster] = useState([]);
    const [gwgScorer, setGwgScorer] = useState('');
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [endCondition, setEndCondition] = useState('regulation');
    const [isEmptyNet, setIsEmptyNet] = useState(false);
    const [totalShots, setTotalShots] = useState(0);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [takenScorers, setTakenScorers] = useState([]);
    const [takenShotTotals, setTakenShotTotals] = useState([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const flipContainerRef = useRef();

    const labelStyle = "block text-sm font-bold text-star-silver text-center mb-1";
    const currentPrediction = existingPrediction?.prediction || existingPrediction;

    // GSAP animation for the flip
    useGSAP(() => {
        gsap.set(flipContainerRef.current, { perspective: 1000 });
        gsap.to(flipContainerRef.current, {
            duration: 0.8,
            rotationY: isFlipped ? 180 : 0,
            ease: "back.inOut(1.7)",
        });
    }, { dependencies: [isFlipped], scope: flipContainerRef });

    // Pre-fill the form when editing an existing prediction
    useEffect(() => {
        if (currentPrediction) {
            const { score, winningTeam, gwgScorer, endCondition, isEmptyNet, totalShots } = currentPrediction;
            if (score && typeof score === 'string') {
                const [away, home] = score.split('-').map(Number);
                setAwayScore(away || 0);
                setHomeScore(home || 0);
            }
            setWinningTeam(winningTeam || '');
            setGwgScorer(gwgScorer || '');
            setEndCondition(endCondition || 'regulation');
            setIsEmptyNet(isEmptyNet || false);
            setTotalShots(totalShots || 0);
        }
    }, [existingPrediction]);

    // Listen for real-time updates on taken picks
    useEffect(() => {
        const db = getFirestore();
        const gamePicksRef = doc(db, "gamePicks", String(game.id));
        const unsubscribe = onSnapshot(gamePicksRef, (doc) => {
            const data = doc.data();
            setTakenScorers(data?.takenGwgScorers || []);
            setTakenShotTotals(data?.takenShotTotals || []);
        });
        return () => unsubscribe();
    }, [game.id]);

    // Fetch the roster when a winning team is selected
    useEffect(() => {
        if (!winningTeam) {
            setRoster([]);
            return;
        }
        const fetchRoster = async () => {
            setLoadingRoster(true);
            try {
                const response = await axios.get(`https://cbj-prediction-app.onrender.com/api/roster/${winningTeam}`);
                setRoster([...response.data.forwards, ...response.data.defensemen]);
            } catch (error) {
                setMessage('Error fetching player list.');
            } finally {
                setLoadingRoster(false);
            }
        };
        fetchRoster();
    }, [winningTeam]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('Submitting...');
        const prediction = { 
            winningTeam, 
            gwgScorer, 
            score: `${awayScore}-${homeScore}`, 
            endCondition, 
            isEmptyNet,
            totalShots: Number(totalShots) 
        };
        try {
            await axios.post('https://cbj-prediction-app.onrender.com/api/predictions', {
                userId, gameId: game.id, prediction, startTimeUTC: game.startTimeUTC
            });
            setIsFlipped(true); // Trigger the flip animation
            setTimeout(() => {
                closeForm();
            }, 4500); // Close form after a longer delay to show GIF
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to save prediction.');
            setIsSubmitting(false); // Re-enable button on error
        }
    };

    const isShotTotalTakenByOther = takenShotTotals.includes(Number(totalShots)) && Number(totalShots) !== currentPrediction?.totalShots;

    return (
        <div ref={flipContainerRef} style={{ transformStyle: "preserve-3d" }} className="relative mt-6 border-t border-slate-gray pt-6">
            {/* Back of the card (Success Message) */}
            <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} className="absolute inset-0 flex flex-col items-center justify-center">
                <CelebrationGif winningTeam={winningTeam} />
                <p className="text-2xl font-bold text-ice-white font-quantico">Prediction Saved!</p>
            </div>

            {/* Front of the card (The Form) */}
            <div style={{ backfaceVisibility: "hidden" }}>
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-down">
                    <fieldset>
                        <legend className="text-lg font-quantico text-ice-white mb-4 text-center">Select the Winning Team</legend>
                        <TeamSelector game={game} selectedTeam={winningTeam} onSelect={setWinningTeam} />
                    </fieldset>

                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-gray pt-6">
                        <legend className="text-lg font-quantico text-ice-white mb-4 col-span-full text-center">Enter the Details</legend>
                        <div>
                            <label className={labelStyle}>Game-Winning Goal Scorer:</label>
                            <PlayerSelector 
                                roster={roster}
                                selectedPlayer={gwgScorer}
                                onSelect={setGwgScorer}
                                takenScorers={takenScorers}
                                currentPick={currentPrediction?.gwgScorer}
                                disabled={!roster.length}
                                loading={loadingRoster}
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Final Score:</label>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <StyledNumberInput value={awayScore} onChange={setAwayScore} teamAbbrev={game.awayTeam.abbrev} />
                                <span className="text-star-silver">to</span>
                                <StyledNumberInput value={homeScore} onChange={setHomeScore} teamAbbrev={game.homeTeam.abbrev} />
                            </div>
                        </div>
                        <div>
                            <label className={labelStyle}>Game Ends In:</label>
                            <StyledSelect value={endCondition} onChange={(e) => setEndCondition(e.target.value)}>
                                <option value="regulation">Regulation</option>
                                <option value="overtime">Overtime</option>
                                <option value="shootout">Shootout</option>
                            </StyledSelect>
                        </div>
                        <div>
                            <label className={labelStyle}>Total Shots on Goal:</label>
                            <input type="number" value={totalShots} onChange={(e) => setTotalShots(e.target.value)} min="0" className="w-full h-12 px-3 py-2 text-center bg-slate-gray/50 border border-slate-gray/50 rounded-md shadow-sm text-ice-white focus:outline-none focus:ring-2 focus:ring-goal-red [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            {isShotTotalTakenByOther && <p className="text-red-500 text-sm mt-1 text-center">This shot total has been taken.</p>}
                        </div>
                        <div className="md:col-span-2 flex items-center justify-center pt-4 gap-3">
                            <label htmlFor="empty-net-toggle" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="empty-net-toggle" className="sr-only peer" checked={isEmptyNet} onChange={(e) => setIsEmptyNet(e.target.checked)} />
                                <div className="w-11 h-6 bg-slate-gray rounded-full peer peer-focus:ring-2 peer-focus:ring-goal-red peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-goal-red"></div>
                            </label>
                            <span className="text-sm font-bold text-star-silver">Final Goal is Empty Net?</span>
                        </div>
                    </fieldset>
                    
                    <div className="flex justify-center mt-6">
                        <button type="submit" disabled={isSubmitting || !winningTeam || !gwgScorer || isShotTotalTakenByOther} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded disabled:bg-gray-400 font-quantico uppercase tracking-wider">
                            Save Predictions
                        </button>
                    </div>
                    {message && <p className="mt-4 text-center">{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default PredictionForm;
