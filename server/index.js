// server/index.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- API Endpoints ---

// server/index.js

app.get('/api/schedule', async (req, res) => {
  try {
    const url = 'https://api-web.nhle.com/v1/club-schedule-season/CBJ/now';
    const response = await axios.get(url);

    // Get all games from the API response
    const allGames = response.data.games;
    
    // Get the current time
    const now = new Date();

    // Filter to find only games that start in the future
    const upcomingGames = allGames.filter(game => new Date(game.startTimeUTC) > now);

    // Take the first 5 games from that upcoming list
    const nextFiveGames = upcomingGames.slice(0, 5);

    // Send only those 5 games to the client
    res.json({ games: nextFiveGames });

  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).send("Failed to fetch NHL schedule.");
  }
});

// We will add more endpoints here for predictions, leaderboard, etc.

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// server/index.js

// server/index.js

app.post('/api/predictions', async (req, res) => {
  const { userId, gameId, prediction, startTimeUTC } = req.body;
  // ... (Input validation and deadline check remain the same) ...

  const predictionRef = db.collection('predictions').doc(`${userId}_${gameId}`);
  const gamePicksRef = db.collection('gamePicks').doc(String(gameId));

  try {
    await db.runTransaction(async (transaction) => {
      const gamePicksDoc = await transaction.get(gamePicksRef);
      const userPredictionDoc = await transaction.get(predictionRef);

      const takenScorers = gamePicksDoc.data()?.takenGwgScorers || [];
      const takenShots = gamePicksDoc.data()?.takenShotTotals || [];
      const previousPick = userPredictionDoc.data()?.prediction;

      // Check if GWG scorer is taken
      if (takenScorers.includes(prediction.gwgScorer) && prediction.gwgScorer !== previousPick?.gwgScorer) {
        throw new Error("PLAYER_TAKEN");
      }
      // Check if shot total is taken
      if (takenShots.includes(Number(prediction.totalShots)) && Number(prediction.totalShots) !== previousPick?.totalShots) {
        throw new Error("SHOTS_TAKEN");
      }

      // Update the list of taken picks
      let updatedTakenScorers = [...takenScorers];
      let updatedTakenShots = [...takenShots];

      if (previousPick) { // If user is changing their prediction
        if (previousPick.gwgScorer !== prediction.gwgScorer) {
          updatedTakenScorers = updatedTakenScorers.filter(id => id !== previousPick.gwgScorer);
        }
        if (Number(previousPick.totalShots) !== Number(prediction.totalShots)) {
          updatedTakenShots = updatedTakenShots.filter(s => s !== Number(previousPick.totalShots));
        }
      }
      if (!updatedTakenScorers.includes(prediction.gwgScorer)) {
        updatedTakenScorers.push(prediction.gwgScorer);
      }
      if (!updatedTakenShots.includes(Number(prediction.totalShots))) {
        updatedTakenShots.push(Number(prediction.totalShots));
      }
      
      transaction.set(gamePicksRef, { takenGwgScorers: updatedTakenScorers, takenShotTotals: updatedTakenShots }, { merge: true });
      transaction.set(predictionRef, { userId, gameId, prediction, startTimeUTC, timestamp: new Date() });
    });

    res.status(201).send({ message: "Prediction saved successfully!" });
  } catch (error) {
    if (error.message === "PLAYER_TAKEN") {
      return res.status(409).send({ message: "This player has already been selected." });
    }
    if (error.message === "SHOTS_TAKEN") {
      return res.status(409).send({ message: "This shot total has already been selected." });
    }
    console.error("Error in prediction transaction:", error);
    res.status(500).send({ message: "An error occurred while saving your prediction." });
  }
});

// Add this to server/index.js
app.get('/api/roster/:teamAbbrev', async (req, res) => {
    try {
        const { teamAbbrev } = req.params;
        const url = `https://api-web.nhle.com/v1/roster/${teamAbbrev.toUpperCase()}/current`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching roster:", error);
        res.status(500).send("Failed to fetch roster.");
    }
});

// Add to server/index.js
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboardRef = db.collection('users');
        // Assuming you have a 'users' collection where each doc has a 'totalScore' field
        const snapshot = await leaderboardRef.orderBy('totalScore', 'desc').limit(25).get();
        const leaderboard = snapshot.docs.map(doc => doc.data());
        res.json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).send("Failed to fetch leaderboard.");
    }
});

// Add this inside your server/index.js file
app.post('/api/predictions', async (req, res) => {
  try {
    const { userId, gameId, prediction } = req.body; // Assuming a simple structure for now
    if (!userId || !gameId || !prediction) {
      return res.status(400).send("Missing required prediction data.");
    }

    // We'll create a unique ID for the prediction document
    const predictionRef = db.collection('predictions').doc(`${userId}_${gameId}`);
    await predictionRef.set({
      userId,
      gameId,
      ...prediction,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).send({ message: "Prediction saved successfully!" });
  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).send("Failed to save prediction.");
  }
});

// RE-PASTE THIS ENTIRE BLOCK INTO server/index.js

const SCORING_SECRET = process.env.SCORING_SECRET || "supersecret";

// server/index.js

app.post('/api/score-game/:gameId', async (req, res) => {
    const { secret } = req.body;
    if (secret !== (process.env.SCORING_SECRET || "supersecret")) {
        return res.status(401).send("Unauthorized: Invalid secret.");
    }

    const { gameId } = req.params;
    console.log(`Starting scoring process for gameId: ${gameId}`);

    try {
        const gameResultUrl = `https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`;
        const gameResponse = await axios.get(gameResultUrl);
        const gameData = gameResponse.data;

        // --- 1. Determine Actual Game Results ---
        const actualHomeScore = gameData.homeTeam.score;
        const actualAwayScore = gameData.awayTeam.score;
        const actualWinnerAbbrev = actualHomeScore > actualAwayScore ? gameData.homeTeam.abbrev : gameData.awayTeam.abbrev;
        const actualTotalShots = gameData.awayTeam.sog + gameData.homeTeam.sog;

        // Determine actual game end condition
        let actualEndCondition = "regulation";
        if (gameData.summary.shootout.length > 0) {
            actualEndCondition = "shootout";
        } else if (gameData.periodDescriptor.periodType === "OT") {
            actualEndCondition = "overtime";
        } else {
            const lastGoal = gameData.summary.scoring.flatMap(p => p.goals).pop();
            if (lastGoal && lastGoal.goalModifier === "empty-net") {
                actualEndCondition = "regulation-en";
            }
        }

        // --- 2. Fetch All Predictions for this Game ---
        const predictionsSnapshot = await db.collection('predictions').where('gameId', '==', Number(gameId)).get();
        if (predictionsSnapshot.empty) {
            return res.send("Scoring finished: No predictions to score.");
        }
        const predictions = predictionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // --- 3. Process Scoring Logic ---
        const userPoints = {}; // { userId: points }

        // Helper to initialize user points
        const initUser = (userId) => {
            if (!userPoints[userId]) userPoints[userId] = 0;
        };

        // A. Score Final Score & Closest Score
        const correctWinnerPredictions = predictions.filter(p => p.prediction.winningTeam === actualWinnerAbbrev);
        let closestScoreDiff = Infinity;
        let closestScoreWinners = [];

        correctWinnerPredictions.forEach(p => {
            initUser(p.userId);
            const [pAway, pHome] = p.prediction.score.split('-').map(Number);
            
            // Exact Score + Winner = 5 points
            if (pAway === actualAwayScore && pHome === actualHomeScore) {
                userPoints[p.userId] += 5;
            } else {
                // Calculate score differential for "closest" logic
                const diff = Math.abs(pAway - actualAwayScore) + Math.abs(pHome - actualHomeScore);
                if (diff < closestScoreDiff) {
                    closestScoreDiff = diff;
                    closestScoreWinners = [p.userId];
                } else if (diff === closestScoreDiff) {
                    closestScoreWinners.push(p.userId);
                }
            }
        });

        // Award points for closest score
        if (closestScoreWinners.length === 1) {
            userPoints[closestScoreWinners[0]] += 2; // Sole winner gets 2 points
        } else if (closestScoreWinners.length > 1) {
            closestScoreWinners.forEach(userId => userPoints[userId] += 1); // Tied winners get 1 point
        }

        // B. Score Game End Condition & Shots
        let closestShotDiff = Infinity;
        let closestShotWinners = [];
        let exactShotWinner = null;

        predictions.forEach(p => {
            initUser(p.userId);
            const predictedShots = Number(p.prediction.totalShots);

            // Game End Points
            const predictedEnd = p.prediction.endCondition;
            if (predictedEnd === actualEndCondition) {
                if (predictedEnd === "shootout") userPoints[p.userId] += 5;
                else if (predictedEnd === "overtime") userPoints[p.userId] += 3;
                else if (predictedEnd === "regulation-en") userPoints[p.userId] += 2;
                else if (predictedEnd === "regulation") userPoints[p.userId] += 1;
            } else if (predictedEnd === "regulation-en" && actualEndCondition !== "regulation-en") {
                userPoints[p.userId] -= 2; // Penalty for wrong empty net guess
            }

            // Total Shots Logic
            if (predictedShots === actualTotalShots) {
                exactShotWinner = p.userId;
            } else {
                const diff = Math.abs(predictedShots - actualTotalShots);
                if (diff < closestShotDiff) {
                    closestShotDiff = diff;
                    closestShotWinners = [p.userId];
                } else if (diff === closestShotDiff) {
                    closestShotWinners.push(p.userId);
                }
            }
        });

        // Award points for shots
        if (exactShotWinner) {
            userPoints[exactShotWinner] += 4;
        } else if (closestShotWinners.length > 0) {
            // Since shot totals are unique, there can't be a tie for closest
            userPoints[closestShotWinners[0]] += 2;
        }

        // --- 4. Update Firestore Database ---
        const batch = db.batch();
        for (const userId in userPoints) {
            const userDocRef = db.collection('users').doc(userId);
            batch.update(userDocRef, { totalScore: admin.firestore.FieldValue.increment(userPoints[userId]) });
            console.log(`Awarding ${userPoints[userId]} points to user ${userId}`);
        }
        await batch.commit();

        res.status(200).send(`Scoring complete for game ${gameId}.`);

    } catch (error) {
        console.error("Error during scoring process:", error);
        res.status(500).send("An error occurred during scoring.");
    }
});

// past games
app.get('/api/results', async (req, res) => {
  try {
    const url = 'https://api-web.nhle.com/v1/club-schedule-season/CBJ/now';
    const response = await axios.get(url);
    const allGames = response.data.games;

    // Get the current time to determine which games are in the past
    const now = new Date();

    // Filter for games where the start time is before the current time
    const pastGames = allGames.filter(game => new Date(game.startTimeUTC) < now);

    // Sort the games in reverse chronological order (most recent first)
    pastGames.sort((a, b) => new Date(b.startTimeUTC) - new Date(a.startTimeUTC));

    // Send the sorted list of past games to the client
    res.json({ games: pastGames });

  } catch (error) {
    console.error("Error fetching game results:", error);
    res.status(500).send("Failed to fetch game results.");
  }
});

// My Predictions

app.get('/api/my-predictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).send("User ID is required.");
    }

    const predictionsRef = db.collection('predictions');
    const snapshot = await predictionsRef.where('userId', '==', userId).get();

    if (snapshot.empty) {
      return res.json({}); // Return an empty object if no predictions found
    }

    // Convert the predictions into a map for easy lookup on the frontend
    // The key will be the gameId, and the value will be the prediction data
    const predictionsMap = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      predictionsMap[data.gameId] = data;
    });

    res.json(predictionsMap);
  } catch (error) {
    console.error("Error fetching user predictions:", error);
    res.status(500).send("Failed to fetch user predictions.");
  }
});