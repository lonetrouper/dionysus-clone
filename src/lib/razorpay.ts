"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Razorpay from "razorpay";

export const createCheckoutSession = async (credits: number) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const orderDetails = {
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${credits} Byteblaze Credits`,
          },
          unit_amount: Math.round((credits / 50) * 100),
        },
        quantity: 1,
      },
    ],
    customer_creation: "always",
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    client_reference_id: userId.toString(),
    metadata: {
      credits,
    },
  };
  const session = await stripe.checkout.sessions.create(orderDetails);
  return redirect(session.url)
};
