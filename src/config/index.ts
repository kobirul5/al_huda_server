import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const env = process.env.NODE_ENV || "development";
const port = Number(process.env.PORT || 5000);
const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
const clientUrl =
  process.env.FRONTEND_BASE_URL ||
  process.env.CLIENT_URL ||
  "http://localhost:3000";

const config = {
  env,
  NODE_ENV: env,
  port,
  databaseUrl: process.env.DATABASE_URL,
  bcrypt_salt_rounds: bcryptSaltRounds,
  frontend_url: process.env.FRONTEND_BASE_URL || clientUrl,
  APP_DASHBOARD_URL: process.env.APP_DASHBOARD_URL,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },

  brevoMail: {
    api_key: process.env.BREVO_API_KEY,
    api_secret: process.env.BREVO_API_SECRET,
    email: process.env.BREVO_EMAIL,
    sender_name: process.env.BREVO_SENDER_NAME,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    url:
      process.env.CLOUDINARY_URL ||
      process.env.ENVIRONMENT_VARIABLE?.replace("CLOUDINARY_URL=", ""),
  },
  hadith: {
    apiBaseUrl:
      process.env.HADITH_API_BASE_URL || "https://api.hadith.gading.dev",
    minHadithCount: Number(process.env.MIN_HADITH_COUNT) || 200,
  },
};

export default config;
