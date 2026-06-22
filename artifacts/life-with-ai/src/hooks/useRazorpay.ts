import { useCallback } from "react";
import { useCreatePaymentOrder, useVerifyPayment } from "@workspace/api-client-react";
import { OrderItemType } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const { toast } = useToast();
  const createPaymentOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const loadRazorpay = useCallback(async () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initiatePayment = useCallback(
    async (itemId: string, itemType: OrderItemType, onSuccess: () => void, onFailure: () => void) => {
      try {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          toast({
            title: "Payment gateway failed to load",
            description: "Please check your internet connection and try again.",
            variant: "destructive",
          });
          return;
        }

        const orderData = await createPaymentOrder.mutateAsync({
          data: { itemId, itemType },
        });

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          name: "LIFE WITH AI",
          description: `Purchase ${itemType === "course" ? "Course" : "PDF"}`,
          handler: async (response: any) => {
            try {
              await verifyPayment.mutateAsync({
                data: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  itemId,
                  itemType,
                },
              });
              onSuccess();
            } catch (err) {
              onFailure();
            }
          },
          prefill: {
            name: "",
            email: "",
          },
          theme: {
            color: "#2563EB", // Tailwind blue-600
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          onFailure();
        });
        rzp.open();
      } catch (error: any) {
        toast({
          title: "Payment initiation failed",
          description: error?.message || "An error occurred while creating the order.",
          variant: "destructive",
        });
      }
    },
    [createPaymentOrder, verifyPayment, loadRazorpay, toast]
  );

  return { initiatePayment };
}
