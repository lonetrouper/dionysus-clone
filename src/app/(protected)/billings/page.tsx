"use client";
import { Info } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
// import { createCheckoutSession } from "~/lib/razorpay";
import { api } from "~/trpc/react";
import { RazorpayPayment } from "../payment/page";

const BillingPage = () => {
  const { data: user } = api.project.getMyCredits.useQuery();
  const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([100]);
  const creditsToBuyAmount = creditsToBuy[0]!;
  const price = (creditsToBuyAmount / 50).toFixed(2);

  const [paymentOpen, setPaymentOpen] = useState(false);

  const router = useRouter();

  const handlePaymentSuccess = (data: any) => {
    toast.success(
      `Payment Successful, You've purchased credits ${creditsToBuyAmount} credits`,
    );
    setPaymentOpen(false);
    router.push("/create");
  };

  const handlePaymentFailure = (error: any) => {
    toast.error(`Payment Failed: ${error.message}`);
    setPaymentOpen(false);
  };
  return (
    <div>
      <h1 className="text-xl font-semibold">Billing</h1>
      <div className="h-2"></div>
      <p className="text-sm text-gray-500">
        You currently have {user?.credits} credits
      </p>
      <div className="h-2"></div>
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm">
            Each credit allow you to index 1 file in a repository
          </p>
        </div>
        <p className="text-sm">
          E.g. If your project has 100 files, you will need 100 credits to index
          it.
        </p>
      </div>
      <div className="h-4"></div>
      <Slider
        defaultValue={[100]}
        max={1000}
        min={10}
        step={10}
        onValueChange={(value) => setCreditsToBuy(value)}
        value={creditsToBuy}
      />
      <div className="h-4"></div>
      <Button
        onClick={() => {
          setPaymentOpen(true);
        }}
      >
        Buy {creditsToBuyAmount} credits for ${price}
      </Button>

      {paymentOpen && user?.emailAddress && (
        <RazorpayPayment
          customerId={user.id}
          name={user?.firstName || "User"}
          email={user.emailAddress}
          amount={parseFloat(price)}
          credits={creditsToBuyAmount}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
};

export default BillingPage;
