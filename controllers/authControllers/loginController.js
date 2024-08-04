import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import logger from "../../utils/Logger.js";

const secret = process.env.JWT_SECRET;

export const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // User not found
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Password is incorrect
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1h" });

    // Send response with token
    res.json({ token });
  } catch (error) {
    // Log error and send server error response
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
