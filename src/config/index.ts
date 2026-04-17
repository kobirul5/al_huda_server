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
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
    smtp_server: process.env.SMTP_SERVER || process.env.smtp_server,
    smtp_port: process.env.SMTP_PORT || process.env.smtp_port,
    smtp_user: process.env.SMTP_USER || process.env.smtp_user,
    smtp_pass: process.env.SMTP_PASS || process.env.smtp_pass,
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
  stripe: {
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    secret_key: process.env.STRIPE_SECRET_KEY,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    admin_account: process.env.STRIPE_ADMIN_ACCOUNT_ID,
  },
  platformCharge: {
    percentage: Number(process.env.PLATFORM_CHARGE_PERCENTAGE) || 10,
  },
  client: {
    url: clientUrl,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  hadith: {
    apiBaseUrl:
      process.env.HADITH_API_BASE_URL || "https://api.hadith.gading.dev",
    minHadithCount: Number(process.env.MIN_HADITH_COUNT) || 200,
  },
};

export default config;
