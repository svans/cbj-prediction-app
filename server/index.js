// server/index.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// --- Firebase Initialization ---
const serviceAccountConfig = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig)
});

const db = admin.firestore();

// --- Express App Setup ---
const app = express();
const allowedOrigins = ['http://localhost:5173', 'https://cbj-prediction-app-5c396.web.app'];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SCORING_SECRET = process.env.SCORING_SECRET || "supersecret";

// --- API Endpoints ---

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).send('Server is up and running!');
});

// Get Upcoming Games (with offseason logic)
app.get('/api/schedule', async (req, res) => {
    try {
        const url = 'https://api-web.nhle.com/v1/club-schedule-season/CBJ/now';
        const response = await axios.get(url);
        const allGames = response.data.games;
        const now = new Date();
        let gamesToShow = allGames.filter(game => new Date(game.startTimeUTC) > now);
        if (gamesToShow.length === 0) {
            const pastGames = allGames.filter(game => new Date(game.startTimeUTC) < now);
            gamesToShow = pastGames.sort((a, b) => new Date(b.startTimeUTC) - new Date(a.startTimeUTC)).slice(0, 5);
        } else {
            gamesToShow = gamesToShow.slice(0, 5);
        }
        res.json({ games: gamesToShow });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).send("Failed to fetch NHL schedule.");
    }
});

// Get Past Game Results
app.get('/api/results', async (req, res) => {
    try {
        const url = 'https://api-web.nhle.com/v1/club-schedule-season/CBJ/now';
        const response = await axios.get(url);
        const allGames = response.data.games;
        const now = new Date();
        const pastGames = allGames.filter(game => new Date(game.startTimeUTC) < now);
        pastGames.sort((a, b) => new Date(b.startTimeUTC) - new Date(a.startTimeUTC));
        res.json({ games: pastGames });
    } catch (error) {
        console.error("Error fetching game results:", error);
        res.status(500).send("Failed to fetch game results.");
    }
});

// Get Team Roster
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

// Get Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboardRef = db.collection('users');
        const snapshot = await leaderboardRef.orderBy('totalScore', 'desc').limit(25).get();
        const leaderboard = snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() }));
        res.json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).send("Failed to fetch leaderboard.");
    }
});

// Get a User's Predictions
app.get('/api/my-predictions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const predictionsRef = db.collection('predictions');
        const snapshot = await predictionsRef.where('userId', '==', userId).get();
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

// Get All Predictions for a Game (Community Picks)
app.get('/api/predictions/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const predictionsSnapshot = await db.collection('predictions').where('gameId', '==', Number(gameId)).get();
        if (predictionsSnapshot.empty) return res.json([]);
        
        const predictions = predictionsSnapshot.docs.map(doc => doc.data());
        const userIds = [...new Set(predictions.map(p => p.userId))];
        if (userIds.length === 0) return res.json([]);

        const usersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', userIds).get();
        const usersMap = {};
        usersSnapshot.forEach(doc => { 
            usersMap[doc.id] = doc.data().username || doc.data().email; // Use username, fallback to email
        });

        const populatedPredictions = predictions.map(p => ({ 
            ...p, 
            username: usersMap[p.userId] || 'Unknown User' 
        }));
        res.json(populatedPredictions);
    } catch (error) {
        console.error("Error fetching community predictions:", error);
        res.status(500).send("Failed to fetch community predictions.");
    }
});

// Submit or Update a Prediction
app.post('/api/predictions', async (req, res) => {
    const { userId, gameId, prediction, startTimeUTC } = req.body;
    if (!userId || !gameId || !prediction || !startTimeUTC) {
        return res.status(400).send({ message: "Missing required prediction data." });
    }

    const deadline = new Date(new Date(startTimeUTC).getTime() + 7 * 60 * 1000);
    if (new Date() > deadline) {
        return res.status(403).send({ message: "Prediction failed: The deadline has passed." });
    }

    const predictionRef = db.collection('predictions').doc(`${userId}_${gameId}`);
    const gamePicksRef = db.collection('gamePicks').doc(String(gameId));

    try {
        await db.runTransaction(async (transaction) => {
            const gamePicksDoc = await transaction.get(gamePicksRef);
            const userPredictionDoc = await transaction.get(predictionRef);
            const takenScorers = gamePicksDoc.data()?.takenGwgScorers || [];
            const takenShots = gamePicksDoc.data()?.takenShotTotals || [];
            const previousPick = userPredictionDoc.data()?.prediction;

            if (takenScorers.includes(prediction.gwgScorer) && prediction.gwgScorer !== previousPick?.gwgScorer) {
                throw new Error("PLAYER_TAKEN");
            }
            if (takenShots.includes(Number(prediction.totalShots)) && Number(prediction.totalShots) !== previousPick?.totalShots) {
                throw new Error("SHOTS_TAKEN");
            }

            let updatedTakenScorers = [...takenScorers];
            let updatedTakenShots = [...takenShots];
            if (previousPick) {
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
        if (error.message === "PLAYER_TAKEN") return res.status(409).send({ message: "This player has already been selected." });
        if (error.message === "SHOTS_TAKEN") return res.status(409).send({ message: "This shot total has already been selected." });
        console.error("Error in prediction transaction:", error);
        res.status(500).send({ message: "An error occurred while saving your prediction." });
    }
});

// Score a Real Game
app.post('/api/score-game/:gameId', async (req, res) => {
    const { secret } = req.body;
    if (secret !== SCORING_SECRET) {
        return res.status(401).send("Unauthorized: Invalid secret.");
    }
    const { gameId } = req.params;
    console.log(`Starting scoring process for gameId: ${gameId}`);
    try {
        const gameResultUrl = `https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`;
        const gameResponse = await axios.get(gameResultUrl);
        const gameData = gameResponse.data;
        
        // --- UPDATED SCORING LOGIC ---
        const actualHomeScore = gameData.homeTeam.score;
        const actualAwayScore = gameData.awayTeam.score;
        const actualWinnerAbbrev = actualHomeScore > actualAwayScore ? gameData.homeTeam.abbrev : gameData.awayTeam.abbrev;
        const actualTotalShots = gameData.awayTeam.sog + gameData.homeTeam.sog;

        // Determine actual game end condition (Regulation, OT, or Shootout)
        let actualEndCondition = "regulation";
        if (gameData.summary.shootout.length > 0) {
            actualEndCondition = "shootout";
        } else if (gameData.periodDescriptor.periodType === "OT") {
            actualEndCondition = "overtime";
        }

        // Determine if the final goal was an empty-netter
        const lastGoal = gameData.summary.scoring.flatMap(p => p.goals).pop();
        const actualIsEmptyNet = lastGoal?.goalModifier === "empty-net";
        
        // --- END OF UPDATED LOGIC ---

        const predictionsSnapshot = await db.collection('predictions').where('gameId', '==', Number(gameId)).get();
        if (predictionsSnapshot.empty) {
            return res.send("Scoring finished: No predictions to score.");
        }
        const predictions = predictionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const userPoints = {};
        const initUser = (userId) => { if (!userPoints[userId]) userPoints[userId] = 0; };

        const correctWinnerPredictions = predictions.filter(p => p.prediction.winningTeam === actualWinnerAbbrev);
        let closestScoreDiff = Infinity;
        let closestScoreWinners = [];

        correctWinnerPredictions.forEach(p => {
            initUser(p.userId);
            const [pAway, pHome] = p.prediction.score.split('-').map(Number);
            if (pAway === actualAwayScore && pHome === actualHomeScore) {
                userPoints[p.userId] += 5;
            } else {
                const diff = Math.abs(pAway - actualAwayScore) + Math.abs(pHome - actualHomeScore);
                if (diff < closestScoreDiff) {
                    closestScoreDiff = diff;
                    closestScoreWinners = [p.userId];
                } else if (diff === closestScoreDiff) {
                    closestScoreWinners.push(p.userId);
                }
            }
        });

        if (closestScoreWinners.length === 1) {
            userPoints[closestScoreWinners[0]] += 2;
        } else if (closestScoreWinners.length > 1) {
            closestScoreWinners.forEach(userId => userPoints[userId] += 1);
        }

        let closestShotDiff = Infinity;
        let closestShotWinners = [];
        let exactShotWinner = null;

        predictions.forEach(p => {
            initUser(p.userId);
            const predictedShots = Number(p.prediction.totalShots);
            const predictedEnd = p.prediction.endCondition;
            const predictedIsEmptyNet = p.prediction.isEmptyNet;

            // Score the end condition (Regulation/OT/Shootout)
            if (predictedEnd === actualEndCondition) {
                if (predictedEnd === "shootout") userPoints[p.userId] += 5;
                else if (predictedEnd === "overtime") userPoints[p.userId] += 3;
                else if (predictedEnd === "regulation") userPoints[p.userId] += 1;
            }

            // Score the "Empty Net" checkbox as a separate bet
            if (predictedIsEmptyNet) {
                if (actualIsEmptyNet) {
                    userPoints[p.userId] += 2; // Correctly guessed empty net
                } else {
                    userPoints[p.userId] -= 2; // Incorrectly guessed empty net (penalty)
                }
            }

            // Score shots on goal
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

        if (exactShotWinner) {
            userPoints[exactShotWinner] += 4;
        } else if (closestShotWinners.length > 0) {
            userPoints[closestShotWinners[0]] += 2;
        }

        const batch = db.batch();
        for (const userId in userPoints) {
            const userDocRef = db.collection('users').doc(userId);
            batch.update(userDocRef, { totalScore: admin.firestore.FieldValue.increment(userPoints[userId]) });
            console.log(`Awarding ${userPoints[userId]} points to user ${userId}.`);
        }
        await batch.commit();
        
        res.status(200).send(`Scoring complete for game ${gameId}.`);
    } catch (error) {
        console.error("Error during scoring process:", error);
        res.status(500).send("An error occurred during scoring.");
    }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
