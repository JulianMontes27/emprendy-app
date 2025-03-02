import api from "@/utils/api";
import { NextApiResponseServerIO } from "@/types/types";
import { NextApiRequest } from "next";

// Handles MercadoPago Payments
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método HTTP no es aceptado." });
  }

  try {
    const { body, query } = req;
    const { userId } = query;

    // Validate request body and query parameters
    if (!body) {
      return res.status(400).json({ error: "Request body (data) is missing." });
    }
    if (!userId) {
      return res.status(400).json({ error: "UserId is missing." });
    }

    // Validate required fields in the request body
    const requiredFields = [
      "amount",
      "email",
      "installments",
      "token",
      "membershipId",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    // Create payment using the API
    const pago = await api.pago.buy(
      {
        amount: Number(body.amount),
        email: body.email!,
        installments: body.installments,
        token: body.token,
      },
      {
        userId: userId as string,
        membershipId: body.membershipId, // Pass membershipId from the request body
      }
    );
    // Emit a socket event to notify clients about the payment
    const tableKey = `user:${userId}:pagos`;
    res?.socket?.server?.io?.emit(tableKey, pago);

    // Return success response
    return res.status(200).json({ message: "success", data: pago });
  } catch (error) {
    console.error("[PAGOS_POST]", error);

    // Return a generic error message to the client
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
