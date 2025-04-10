import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { db } from "~/server/db";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const signature = request.headers.get("x-razorpay-signature") || "";
  try {
    if (
      validateWebhookSignature(
        JSON.stringify(body),
        signature,
        process.env.RAZORPAY_WEBHOOK_SECRET || "",
      )
    ) {
      console.log("Webhook Signature is valid");
    } else {
      console.log("Webhook Signature is invalid");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    const { event, payload } = body;
    const { customerId, credits } = payload.payment.entity.notes;
    const { id: razorpayPaymentId, order_id: razorpayOrderId } = payload.payment.entity;
    console.log("Webhook payload:", payload.payment.entity.notes);
    if (event === "payment.captured") {
      await db.razorpayTransaction.create({
        data: {
          razorpayPaymentId,
          razorpayOrderId,
          credits,
          userId: customerId,
        },
      });
      await db.user.update({
        where: { id: customerId },
        data: { credits: { increment: credits } },
      });
    return NextResponse.json({ body: "Credits added successfully" }, { status: 200 });
    }
    return NextResponse.json({ body: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error in webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
