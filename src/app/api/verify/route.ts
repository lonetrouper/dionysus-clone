// src/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { z } from "zod";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";

const bodySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  credits: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, credits } =
      bodySchema.parse(body);

    // Verify signature
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpaySignature) {
      console.log("Signature mismatch:", generated_signature);
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 },
      );
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "";
    if (
      !validatePaymentVerification(
        { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
        generated_signature,
        razorpaySecret,
      )
    ) {
      console.log("Razorpay payment verification failed");
      return NextResponse.json(
        { success: false, message: "Razorpay payment validation failed" },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { success: true, message: "Razorpay payment validation successful" },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 },
    );
  }
}
