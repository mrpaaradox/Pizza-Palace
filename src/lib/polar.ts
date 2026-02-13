import { env } from "@/lib/env";

interface CheckoutItem {
  name: string;
  quantity: number;
  price: number;
}

interface CreateCheckoutParams {
  items: CheckoutItem[];
  customerEmail: string;
  customerName?: string;
  orderId: string;
}

export async function createPolarCheckout({
  items,
  customerEmail,
  customerName,
  orderId,
}: CreateCheckoutParams) {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  // Build products query param using the product ID from Polar
  const productsParam = encodeURIComponent(JSON.stringify([{
    product_id: env.POLAR_PRODUCT_ID,
    quantity: 1,
  }]));

  const url = `${baseUrl}/api/checkout?products=${productsParam}&customer_email=${encodeURIComponent(customerEmail)}&success_url=${encodeURIComponent(`${baseUrl}/api/checkout/success?checkout_id={CHECKOUT_ID}`)}&cancel_url=${encodeURIComponent(`${baseUrl}/dashboard/cart?payment=cancelled`)}&metadata[orderId]=${orderId}&metadata[customerName]=${customerName || ""}`;

  const response = await fetch(url, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Polar checkout error:", error);
    throw new Error("Failed to create checkout session");
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.url,
    clientSecret: data.client_secret,
    status: data.status,
  };
}
