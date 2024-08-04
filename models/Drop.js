import mongoose from "mongoose";

const dropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Drop = mongoose.model("Drop", dropSchema);

export default Drop;
