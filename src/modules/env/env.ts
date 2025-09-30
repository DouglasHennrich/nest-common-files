import { z } from 'zod';

export const envSchema = z.object({
  /// //////////////////////////
  //  Infrastructure
  /// //////////////////////////
  INFRA_PORT: z.coerce.number().optional().default(3333),
  INFRA_URL: z.string().url().default('http://localhost'),
  INFRA_ENVIRONMENT: z.preprocess(
    () => process.env.NODE_ENV, // always use process.env.NODE_ENV
    z.enum(['development', 'production']).default('development'),
  ),
  INFRA_FRONTEND_URL: z.string().url(),

  /// //////////////////////////
  //  Database
  /// //////////////////////////
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_DB_NAME: z.string().default('postgres'),
  DATABASE_IGNORE_MIGRATIONS: z.coerce.boolean().default(false),

  /// //////////////////////////
  //  Auth
  /// //////////////////////////
  AUTH_JWT_PRIVATE_KEY: z.string(),
  AUTH_JWT_PUBLIC_KEY: z.string(),
  AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN: z.string(),
  AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN: z.string(),

  /// //////////////////////////
  //  Secrets
  /// //////////////////////////
  SECRET_ADMIN_ACCESS_TOKEN: z.string().default('admin_access_token'),

  /// //////////////////////////
  //  Utilities
  /// //////////////////////////
  UTILITIES_PAGINATION_LIMIT: z.coerce.number().default(100),

  /// //////////////////////////
  //  External APIS
  /// //////////////////////////
  // Encrypt Decrypt
  EXTERNAL_ENCRYPT_DECRYPT_ALGORITHM: z.string().default('aes-256-cbc'),
  EXTERNAL_ENCRYPT_DECRYPT_KEY: z.string().default('encryption_key'),
  EXTERNAL_ENCRYPT_DECRYPT_IV: z.string().default('encryption_iv'),

  /// //////////////////////////
  //  AWS S3
  /// //////////////////////////
  EXTERNAL_AWS_ACCESS_KEY_ID: z.string(),
  EXTERNAL_AWS_SECRET_ACCESS_KEY: z.string(),
  EXTERNAL_AWS_S3_REGION: z.string().default('us-east-1'),
  EXTERNAL_AWS_S3_BUCKET: z.string(),

  /// //////////////////////////
  //  Discord
  /// //////////////////////////
  EXTERNAL_DISCORD_WEBHOOK_URL: z.string().url(),

  /// //////////////////////////
  //  Sentry
  /// //////////////////////////
  EXTERNAL_SENTRY_DSN: z.string().url(),
});

export type TEnvironment = z.infer<typeof envSchema>;
