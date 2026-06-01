const path = require("path");
const { config } = require("dotenv");
const { z } = require("zod");

config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Allow comma-separated origins for dev setups (we'll validate at runtime)
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(16),
  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  GITHUB_TOKEN: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

module.exports = { env };