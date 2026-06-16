import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { config } from "./src/config/config.js";
import authRouter from "./src/routers/authRouter.js";
import userRouter from "./src/routers/userRouter.js";
import helmet from "helmet";
import morgan from "morgan";
import { connectRedis } from "./src/helpers/redisClient.js";
import customerManagementRouter from "./src/routers/customerManagementRouter.js";
import categoryManagementRouter from "./src/routers/categoryManagementRouter.js";
configDotenv();

const app = express();
const port = config.port;
const mongourl = config.mongoUrl;

app.use(helmet());
app.use(morgan("dev"));
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
app.use("api/v1/customers", customerManagementRouter)
app.use("api/v1/category", categoryManagementRouter)

const startServer = async () => {
  try {
    await mongoose.connect(mongourl);
    console.log("Connected to MongoDB");

    await connectRedis();

    app.listen(port, (error) => {
      if (error) {
        console.log("Error starting server:", error);
      } else {
        console.log(`Server started at port ${port}`);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();