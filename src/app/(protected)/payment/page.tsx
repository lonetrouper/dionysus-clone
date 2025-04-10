// src/components/payment/razorpay-payment.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import axios from "axios";

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

const createOrder = async (
  amount: number,
  credits: number,
  customerId: string,
) => {
  try {
    const response = await axios.post("/api/order", {
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: "INR",
      credits,
      customerId,
    });
    return response.data.orderId;
  } catch (error) {
    console.error("Order creation failed:", error);
    throw error;
  }
};

const verifyPayment = async (paymentData: any, credits: number) => {
  try {
    const response = await axios.post("/api/verify", {
      razorpayPaymentId: paymentData.razorpay_payment_id,
      razorpayOrderId: paymentData.razorpay_order_id,
      razorpaySignature: paymentData.razorpay_signature,
      credits,
    });
    return response.data;
  } catch (error) {
    console.error("Payment verification failed:", error);
    throw error;
  }
};
export const RazorpayPayment = ({
  customerId,
  name,
  email,
  amount,
  credits,
  onSuccess,
  onFailure,
}: RazorpayPaymentProps) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  // API to create order on your backend

  const handlePayment = async () => {
    if (!scriptLoaded || processing) return;

    setProcessing(true);
    try {
      const orderId = await createOrder(amount, credits, customerId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "ByteBlaze",
        description: `Purchase ${credits} ByteBlaze credits`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const result = await verifyPayment(response, credits);
            if (result.success) {
              onSuccess?.(response);
            } else {
              onFailure?.(new Error("Payment verification failed"));
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            onFailure?.(error);
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
      setScriptLoaded(false);
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
};