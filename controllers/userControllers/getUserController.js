import User from "../../models/User.js";
import logger from "../../utils/Logger.js";

export const getUserController = async (req, res) => {
  try {
    // Fetch the user by ID, excluding the password field
    const user = await User.findById(req.user._id).select("-password");

    // If user not found, send a 404 (Not Found) response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user profile as a JSON response
    res.json({
      userId: user._id,
      username: user.username,
      name: user.name,
      balance: user.balance,
      openedCases: user.openedCases,
    });
  } catch (error) {
    // Log the error and send a 500 (Internal Server Error) response with error message
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
