import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import logger from "../../utils/Logger.js";

const secret = process.env.JWT_SECRET;

export const registerController = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, secret, {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
      if (error.keyPattern.username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
