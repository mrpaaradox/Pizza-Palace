import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      try {
        console.log("🔍 Attempting to send password reset email to:", user.email);
        console.log("🔍 Reset URL:", url);
        
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
              <p style="color: #666; margin-top: 20px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
        
        if (error) {
          console.error("❌ Password reset email failed:", error);
          throw new Error(`Failed to send email: ${error.message}`);
        }
        
        console.log("✅ Password reset email sent successfully:", data);
      } catch (error) {
        console.error("❌ Error in sendResetPassword:", error);
        throw error;
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    redirectAfterVerification: "/dashboard",
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string | null }; url: string }) => {
      try {
        console.log("🔍 Attempting to send verification email to:", user.email);
        console.log("🔍 Verification URL:", url);
        
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
              <p>Please verify your email address by clicking the link below:</p>
              <a href="${url}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
              <p style="color: #666; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
          `,
        });
        
        if (error) {
          console.error("❌ Email sending failed:", error);
          throw new Error(`Failed to send email: ${error.message}`);
        }
        
        console.log("✅ Verification email sent successfully:", data);
      } catch (error) {
        console.error("❌ Error in sendVerificationEmail:", error);
        throw error;
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
      },
      phone: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      city: {
        type: "string",
        required: false,
      },
      postalCode: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Helper to check if email is Gmail
export const isGmailEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith("@gmail.com");
};
