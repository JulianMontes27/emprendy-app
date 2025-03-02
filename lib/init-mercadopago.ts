import MercadoPagoConfig from "mercadopago";

/* Initialize mercadopago */
export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});
