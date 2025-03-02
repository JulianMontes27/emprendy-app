import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(2).max(50),
});

export type Form = z.infer<typeof formSchema>;

export const getCheckoutSchema = (billAmount: number) =>
  z.object({
    amount: z
      .number()
      .min(1000, "La cantidad debe ser mayor que 1000.")
      .max(
        billAmount,
        `La cantidad no puede exceder el total de ${billAmount}`
      ),
  });
