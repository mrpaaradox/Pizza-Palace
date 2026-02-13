import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "./prisma";
import { env } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  plugins: [admin()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(env.RESEND_API_KEY);
        
        const { data, error } = await resend.emails.send({
          from: env.EMAIL_FROM,
          to: user.email,
          subject: "Reset your password - Pizza Palace",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ef4444;">Reset Your Password</h1>
              <p>Hi ${user.name || "there"},</p>
              <p>Click the link below to reset your password:</p>
              <a href="${url}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
              <p style="color: #666; margin-top: 20px;">This link will expire in 1 hour.</p>
            </div>
          `,
        });
        
        if (error) throw new Error(error.message);
      } catch (error) {
        console.error("Password reset error:", error);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    redirectAfterVerification: "/dashboard",
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string | null }; url: string }) => {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(env.RESEND_API_KEY);
        
        const { data, error } = await resend.emails.send({
          from: env.EMAIL_FROM,
          to: user.email,
          subject: "Verify your email - Pizza Palace",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ef4444;">Welcome to Pizza Palace!</h1>
              <p>Hi ${user.name || "there"},</p>
              <p>Please verify your email:</p>
              <a href="${url}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
            </div>
          `,
        });
        
        if (error) throw new Error(error.message);
      } catch (error) {
        console.error("Verification email error:", error);
      }
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "CUSTOMER" },
      phone: { type: "string", required: false },
      address: { type: "string", required: false },
      city: { type: "string", required: false },
      postalCode: { type: "string", required: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
