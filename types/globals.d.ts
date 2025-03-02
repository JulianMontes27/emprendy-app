// src/globals.d.ts or types/globals.d.ts

export {};

// This declare global {} block extends the global Window interface by adding a cardPaymentBrickController property that includes an unmount method.
declare global {
  interface Window {
    cardPaymentBrickController?: {
      unmount: () => void;
    };
  }
}
