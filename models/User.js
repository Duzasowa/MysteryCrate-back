import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  openedCases: [
    {
      caseId: String,
      count: Number,
      items: [
        {
          itemId: String,
          chance: Number,
          date: { type: Date, default: Date.now },
        },
      ],
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
