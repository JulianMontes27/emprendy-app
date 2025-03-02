"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import CheckoutPage from "./checkout-page";

interface MPPagarProps {
  user: any;
  membership: any;
}

const MPPagar: React.FC<MPPagarProps> = ({ user, membership }) => {
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  const togglePaymentSection = () => {
    setShowPaymentSection((prev) => !prev);
  };

  return (
    <section>
      {/* Toggle Button */}
      <Button
        className="w-full py-4 text-lg font-medium bg-primary hover:bg-primary-dark text-white rounded-lg shadow-md hover:shadow-lg transition-all bg-slate-700"
        onClick={togglePaymentSection}
        aria-label={showPaymentSection ? "Ocultar pago" : "Mostrar pago"}
      >
        {showPaymentSection ? "Ocultar Pago" : "Pagar"}
      </Button>

      {/* Payment Section */}
      {showPaymentSection && (
        <CheckoutPage user={user} membership={membership} />
      )}
    </section>
  );
};

export default MPPagar;
