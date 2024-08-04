import Drop from "../../models/Drop.js";

export const getDrops = async (req, res) => {
  try {
    // Fetch the latest 20 drops sorted by date in descending order
    const drops = await Drop.find().sort({ date: -1 }).limit(20);
    // Send the drops as a JSON response with status 200 (OK)
    res.status(200).json(drops);
  } catch (err) {
    // Log the error and send a 500 (Internal Server Error) response with error message
    logger.error(err);
    res.status(500).json({ message: err.message });
  }
};
