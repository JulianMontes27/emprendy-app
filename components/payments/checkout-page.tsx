"use client";

import React, { useEffect, useState } from "react";
import { useSocketContext } from "@/providers/socket-provider";
import { notFound, useSearchParams } from "next/navigation";
import MercadoPagoCheckout from "./mp-checkout";
import { Subscription } from "@/types/types";
import { formatPriceToCOP } from "@/utils/price-formatter";

interface CheckoutPageProps {
  user: any;
  membership: any;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ user, membership }) => {
  // Handle errors and loading states
  if (!user) return notFound();
  if (!membership) {
    return (
      <div className="text-center text-red-500">
        No hay membresía para pagar.
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col items-center justify-center bg-gradient-to-b  text-white p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-4">
          ¡Gracias por elegirnos!
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Completa tu pago para activar tu membresía.
        </p>

        {/* Payment Section */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Detalles del Pago</h3>
          <p className="text-gray-300 mb-4">
            Total a pagar:{" "}
            <span className="font-bold">
              {formatPriceToCOP(membership.price)}
            </span>
          </p>
          <MercadoPagoCheckout
            price={String(membership.price)}
            user={user}
            membershipId={membership.id}
          />
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
