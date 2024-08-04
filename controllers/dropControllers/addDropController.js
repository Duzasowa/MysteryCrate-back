import Drop from "../../models/Drop.js";

export const addDrop = async (req, res) => {
  const { name, image, username } = req.body;

  // Create a new drop instance
  const newDrop = new Drop({
    name,
    image,
    username,
  });

  try {
    // Save the new drop to the database
    const savedDrop = await newDrop.save();
    // Return a 201 status with the saved drop
    res.status(201).json(savedDrop);
  } catch (err) {
    // Log the error and send a 500 status with the error message
    logger.error(err);
    res.status(500).json({ message: err.message });
  }
};
