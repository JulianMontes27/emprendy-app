import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { Payment } from "mercadopago";
import { mercadopago } from "@/lib/init-mercadopago";
import { subscriptions, payments } from "@/db/schema";

const api = {
  pago: {
    async buy(
      data: {
        amount: number;
        email: string;
        installments: number;
        token: string;
      },
      metadata: {
        userId: string;
        membershipId: string;
      }
    ) {
      // Check if the user has an active subscription
      const activeSubscription = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, metadata.userId),
            eq(subscriptions.status, "active")
          )
        )
        .catch((error) => {
          console.error("Error fetching subscription:", error);
          throw new Error("Failed to fetch subscription data");
        });

      if (activeSubscription.length > 0) {
        throw new Error("User already has an active subscription.");
      }

      // Create the payment with MercadoPago
      const payment = await new Payment(mercadopago).create({
        body: {
          payer: {
            email: data.email,
          },
          token: data.token,
          transaction_amount: Number(data.amount),
          installments: data.installments,
          metadata: {
            userId: metadata.userId,
            membershipId: metadata.membershipId,
          },
        },
      });

      // Handle the payment status
      if (payment.status === "approved") {
        // Create a new subscription for the user
        const newSubscription = await db
          .insert(subscriptions)
          .values({
            userId: metadata.userId,
            membershipId: metadata.membershipId,
            status: "active",
            startDate: new Date(),
            endDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ), // 1-year subscription
          })
          .returning()
          .catch((error) => {
            console.error("Error creating subscription:", error);
            throw new Error("Failed to create subscription");
          });

        // Create a payment record in the database
        await db
          .insert(payments)
          .values({
            subscriptionId: newSubscription[0].id, // Ensure this matches the schema
            paymentGateway: "MercadoPago",
            paymentId: payment.id,
            amount: data.amount,
            status: "completed",
            createdAt: new Date(), // Add createdAt
            updatedAt: new Date(), // Add updatedAt
          })
          .catch((error) => {
            console.error("Error creating payment record:", error);
            throw new Error("Failed to create payment record");
          });

        return {
          message: "Payment successful",
          subscription: newSubscription[0],
          payment: payment,
        };
      } else {
        // Handle payment failure
        throw new Error(`Payment failed with status: ${payment.status}`);
      }
    },
  },
};

export default api;
