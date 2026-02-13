import { Checkout } from "@polar-sh/nextjs";

export const POST = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});
