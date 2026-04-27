import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { config } from "./src/config/config.js";
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
