import User from "../../models/User.js";

export const getAllUsersController = async (req, res) => {
  try {
    // Fetch all users with only the username field
    const users = await User.find({}, "username");
    // Send the users as a JSON response with status 200 (OK)
    res.status(200).json(users);
  } catch (error) {
    // Log the error and send a 500 (Internal Server Error) response with error message
    logger.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};
