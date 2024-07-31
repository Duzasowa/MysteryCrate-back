import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import logger from "../../utils/Logger.js";

const secret = process.env.JWT_SECRET;

export const loginController = async (req, res) => {
  const { username, password } = req.body;
  console.log("WARN", req.body);
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1h" });

    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
