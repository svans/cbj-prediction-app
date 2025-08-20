// client/src/store.js
import { create } from 'zustand';
import axios from 'axios';

const useGameStore = create((set, get) => ({
  // --- STATE ---
  games: [],
  myPredictions: {},
  rosters: {},
  loading: true,
  
  // --- ACTIONS ---

  // Fetches the main schedule and the user's predictions
  fetchGameData: async (userId) => {
    set({ loading: true });
    const scheduleUrl = 'https://cbj-prediction-app.onrender.com/api/schedule';
    
    try {
      if (userId) {
        const myPredictionsUrl = `https://cbj-prediction-app.onrender.com/api/my-predictions/${userId}`;
        const [scheduleRes, predictionsRes] = await Promise.all([
          axios.get(scheduleUrl),
          axios.get(myPredictionsUrl)
        ]);
        set({ games: scheduleRes.data.games, myPredictions: predictionsRes.data });
      } else {
        const scheduleRes = await axios.get(scheduleUrl);
        set({ games: scheduleRes.data.games, myPredictions: {} }); // Reset predictions if logged out
      }
    } catch (error) {
      console.error("Error fetching game data!", error);
    } finally {
      set({ loading: false });
    }
  },

  // Fetches rosters for teams in the user's predictions
  fetchRostersForPredictions: async () => {
    const { myPredictions, rosters } = get(); // Get current state
    const newRosters = {};

    for (const gameId in myPredictions) {
      const prediction = myPredictions[gameId];
      const predData = prediction.prediction || prediction;
      const teamAbbrev = predData.winningTeam;

      if (teamAbbrev && !rosters[teamAbbrev]) {
        try {
          const response = await axios.get(`https://cbj-prediction-app.onrender.com/api/roster/${teamAbbrev}`);
          newRosters[teamAbbrev] = [...response.data.forwards, ...response.data.defensemen];
        } catch (error) {
          console.error(`Failed to fetch roster for ${teamAbbrev}`, error);
        }
      }
    }

    if (Object.keys(newRosters).length > 0) {
      set(state => ({ rosters: { ...state.rosters, ...newRosters } }));
    }
  },
}));

export default useGameStore;
