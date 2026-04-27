import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { config } from "./src/config/config.js";
import authRouter from "./src/routers/authRouter.js";
import userRouter from "./src/routers/userRouter.js";
configDotenv();

const app = express();
const port = config.port;
const mongourl = config.mongoUrl;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    status: "success",
    message: "Welcome to NextMart Admin API",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

mongoose.connect(mongourl).then(() => {
  console.log("Connected to MongoDB");
  app.listen(port, (error) => {
    if (error) {
      console.log("Error starting server:", error);
    } else {
      console.log(`server started at port ${port}`);
    }
  });
});
