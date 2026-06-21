import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  AUTH_GOOGLE_ID: z.string().min(1, 'AUTH_GOOGLE_ID is required'),
  AUTH_GOOGLE_SECRET: z.string().min(1, 'AUTH_GOOGLE_SECRET is required'),
  ADMIN_EMAILS: z.string().optional().default(''),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  const errorDetails = JSON.stringify(parsed.error.format(), null, 2);
  console.error('❌ Environment variable validation failed:\n', errorDetails);
  throw new Error(`Environment validation failed. Please check your .env file configurations.\n${errorDetails}`);
}

export const env = parsed.data;
export type EnvSchemaType = z.infer<typeof envSchema>;
