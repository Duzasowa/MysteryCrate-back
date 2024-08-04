import express from "express";
import cors from "cors";
import authRouters from "./routes/authRoutes.js";
import userRouters from "./routes/userRoutes.js";
import dropRoutes from "./routes/dropRoutes.js";

const app = express();
app.use(express.json());

// Allow all CORS connections
app.use(cors());

app.use(cors(corsOptions));

// Routes
app.use("/auth", authRouters);
app.use("/user", userRouters);
app.use("/drops", dropRoutes);

export default app;
