import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import logger from "../../utils/Logger.js";

const secret = process.env.JWT_SECRET;

export const registerController = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if user with the given email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Check if user with the given username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Create a JWT token for the new user
    const token = jwt.sign({ userId: newUser._id }, secret, {
      expiresIn: "1h",
    });

    // Send a response with the token
    res.status(201).json({ token });
  } catch (error) {
    // Handle unique constraint errors (duplicate key)
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

    // Log the error and send a server error response
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
