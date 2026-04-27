import { configDotenv } from "dotenv";
configDotenv();

export const config = {
  port: process.env.PORT || 5003,
  mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017/NextMart",
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  salt: process.env.SALT,
};
