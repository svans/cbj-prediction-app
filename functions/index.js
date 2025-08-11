// functions/index.js
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {defineString} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const axios = require("axios");

// Define the secret key needed to run our scoring endpoint.
const scoringSecret = defineString("SCORING_SECRET");

// This function will run every day at 5:00 AM UTC (1:00 AM EDT)
exports.scoreYesterdayGames = onSchedule("every day 05:00", async (event) => {
  logger.info("Running daily scoring job...");

  // 1. Figure out yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  try {
    // 2. Fetch the schedule for yesterday
    const scheduleUrl = `https://api-web.nhle.com/v1/schedule/${dateString}`;
    const scheduleResponse = await axios.get(scheduleUrl);
    const games = scheduleResponse.data.gameWeek[0]?.games || [];
    const gamePks = games.map((g) => g.id);

    logger.info(`Found ${gamePks.length} games for ${dateString}.`);

    // 3. Loop through each game and trigger our server's endpoint
    for (const gameId of gamePks) {
      // Note: This URL must point to your *deployed* server,
      // not localhost, for the live function to work.
      const scoringUrl = `http://localhost:3001/api/score-game/${gameId}`;

      try {
        logger.info(`Triggering scoring for gameId: ${gameId}`);
        await axios.post(scoringUrl, {secret: scoringSecret.value()});
        logger.info(`Successfully triggered scoring for ${gameId}.`);
      } catch (error) {
        logger.error(`Failed for ${gameId}:`, error.message);
      }
    }
    logger.info("Daily scoring job finished.");
    return null;
  } catch (error) {
    logger.error("Fatal error running scoring job:", error);
    return null;
  }
});
