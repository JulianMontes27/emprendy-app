"use client";
import { Bill } from "@prisma/client";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import axios from "axios";

interface PaymentBtnProps {
  bill: Bill;
}

const PaymentBtn = ({ bill }: PaymentBtnProps) => {
  const router = useRouter();
  
  const handlePayment = async () => {
    try {
      const res = await axios.post(`/api/pagos/${bill.tableId}`);
      const { data } = res;

      if (data.init_point) {
        // Redirect to the MercadoPago payment URL
        router.push(data.init_point);
      } else {
        console.error("Error initiating payment:", data.error);
      }
    } catch (error) {
      console.error("Payment failed", error);
    }
  };
  return <Button onClick={handlePayment}>PaymentBtn</Button>;
};

export default PaymentBtn;
