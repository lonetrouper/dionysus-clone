// src/components/payment/razorpay-payment.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  customerId: string;
  name: string;
  email: string;
  amount: number;
  credits: number;
  onSuccess: (data: any) => void;
  onFailure?: (error: any) => void;
}

export function RazorpayPayment({
  customerId,
  name,
  email,
  amount,
  credits,
  onSuccess,
  onFailure,
}: RazorpayPaymentProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  // API to create order on your backend
  const createOrder = async () => {
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to smallest currency unit
          currency: "INR",
          credits,
          customerId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");
      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error("Order creation failed:", error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!scriptLoaded || processing) return;

    setProcessing(true);
    try {
      const orderId = await createOrder();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "ByteBlaze",
        description: `Purchase ${credits} ByteBlaze credits`,
        order_id: orderId,
        handler: async function (response: any) {
          // Verify payment on backend
          const verification = await fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              credits,
            }),
          });

          const result = await verification.json();

          if (result.success) {
            onSuccess(result);
          } else {
            onFailure?.(
              new Error(result.message || "Payment verification failed"),
            );
          }
        },
        prefill: { name, email },
        theme: { color: "#3B82F6" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        onFailure?.(response.error);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Payment process failed:", error);
      onFailure?.(error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (scriptLoaded) {
      handlePayment();
    }
  }, [scriptLoaded]);

  return (
    <Script
      id="razorpay-checkout-js"
      src="https://checkout.razorpay.com/v1/checkout.js"
      onLoad={() => setScriptLoaded(true)}
      onError={() => onFailure?.(new Error("Failed to load Razorpay script"))}
    />
  );
}
