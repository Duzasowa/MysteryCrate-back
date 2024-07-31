import User from "../../models/User.js";
import logger from "../../utils/Logger.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      userId: user._id,
      username: user.username,
      name: user.name,
      balance: user.balance,
      openedCases: user.openedCases,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
