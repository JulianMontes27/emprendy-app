/**
 * Formats a number or string as a Colombian Peso (COP) price.
 * @param price - The price to format (can be a number or string).
 * @returns The formatted price as a string (e.g., "$ 1.000.000").
 */
export function formatPriceToCOP(price: number | string): string {
  // Convert the price to a number if it's a string
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  // Check if the conversion resulted in a valid number
  if (isNaN(numericPrice)) {
    throw new Error(
      "Invalid price value. Price must be a number or a numeric string."
    );
  }

  // Format the price with thousand separators and COP symbol
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0, // No decimal places
    maximumFractionDigits: 0, // No decimal places
  }).format(numericPrice);
}
