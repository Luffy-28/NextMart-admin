import { configDotenv } from "dotenv";
configDotenv();

export const config = {
  appName: process.env.APP_NAME,
  clientUrl: process.env.CLIENT_URL,
  port: process.env.PORT || 5003,
  mongoUrl: process.env.MONGO_URL || "mongodb://localhost:27017/NextMart",
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  jwtRefresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },

  salt: parseInt(process.env.SALT) || 10,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  otp: {
    expiry: parseInt(process.env.OTP_EXPIRY) || 300,
    length: parseInt(process.env.OTP_LENGTH) || 6,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  },
};
