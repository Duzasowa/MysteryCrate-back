import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./utils/Logger.js";

const APP_ENV = process.env.APP_ENV || "local";

dotenv.config();

// Uploading a password to the database
const DB = process.env.DATABASE_URL.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

// Connect to database
mongoose
  .connect(DB)
  .then(() => logger.info("DB connected successfully"))
  .catch((err) => logger.err(`DB connection error: ${err.message}`));

const PORT = process.env.PORT;

(async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT} in ${APP_ENV} mode`);
    });
  } catch (error) {
    logger.error(error);
  }
})();
