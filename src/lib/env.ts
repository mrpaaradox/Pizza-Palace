import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  
  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email"),
  
// Polar.sh Payments
  POLAR_ACCESS_TOKEN: z.string().min(1, "POLAR_ACCESS_TOKEN is required"),
  POLAR_ORGANIZATION_ID: z.string().min(1, "POLAR_ORGANIZATION_ID is required"),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_PRODUCT_ID: z.string().optional(),
  POLAR_PRODUCT_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_POLAR_PUBLISHABLE_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;
