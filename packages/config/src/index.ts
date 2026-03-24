import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  UPLOAD_URL_TTL_SECONDS: z.coerce.number().int().positive(),
  DOWNLOAD_URL_TTL_SECONDS: z.coerce.number().int().positive(),
  FILE_RETENTION_HOURS: z.coerce.number().int().positive()
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source);
}

export const readEnv = getEnv;

type LoggerContext = Record<string, unknown>;

export function createLogger(scope: string) {
  return {
    info(event: string, context: LoggerContext = {}) {
      console.log(JSON.stringify({ level: "info", scope, event, ...context }));
    },
    error(event: string, context: LoggerContext = {}) {
      console.error(JSON.stringify({ level: "error", scope, event, ...context }));
    }
  };
}
