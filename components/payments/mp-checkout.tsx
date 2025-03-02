"use client";

import { useEffect } from "react";

import axios from "axios";
import qs from "query-string";

import type {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/bricks/cardPayment/type";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { User } from "@/types/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MercadoPagoCheckout({
  price,
  user,
  membershipId,
}: {
  price: string;
  user: User;
  membershipId: string;
}) {
  const router = useRouter();
  async function handleSubmit(
    data: ICardPaymentFormData<ICardPaymentBrickPayer>
  ) {
    try {
      const url = qs.stringifyUrl({
        url: `/api/socket/pagos`,
        query: {
          userId: user.id,
        },
      });
      //call axios api post request
      await axios
        .post(url, {
          amount: price,
          email: data.payer.email!,
          installments: data.installments,
          token: data.token,
          membershipId,
        })
        .then(() => {
          toast.success(
            "Hemos recibido el pago. Bienvenido a la escuela! Pronto nos pondremos en contacto contigo."
          );
          router.push(`/cliente/${user.id}`);
        });
    } catch (error) {
      console.error("Error during payment submission", error);
    }
  }

  useEffect(() => {
    // Initialize the Mercado Pago SDK
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);
    // Cleanup: unmount the component on page leave
    return () => {
      window?.cardPaymentBrickController?.unmount();
    };
  }, []);

  return (
    <div className="max-w-xl">
      <div className="flex mt-4">
        <CardPayment
          customization={{
            paymentMethods: { maxInstallments: 1, minInstallments: 1 },
            visual: {
              style: {
                theme: "dark",
              },
            },
          }}
          initialization={{ amount: Number(price) }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
