import express from "express";
import { MONGO_URI, PORT } from "./config.mjs";
import logger from "morgan";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.mjs";
import userRoutes from "./routes/user.routes.mjs";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`database connection successful: ${MONGO_URI}`))
  .catch((err) => console.log("unable to connect to database" + err.message));

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(cors());

app.use("/users", userRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ": " + err.message });
  } else if (err) {
    res.status(500).json({ error: err.name + ": " + err.message });
    console.log(err);
  }
});

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
