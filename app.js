import express from "express";
import cors from "cors";
import authRouters from "./routes/authRoutes.js";
import userRouters from "./routes/userRoutes.js";
import dropRoutes from "./routes/dropRoutes.js";

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Routes
app.use("/auth", authRouters);
app.use("/user", userRouters);
app.use("/drops", dropRoutes);

export default app;
