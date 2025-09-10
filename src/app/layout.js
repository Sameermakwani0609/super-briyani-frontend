// app/layout.js
import "../styles/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/playfair-display/400.css";
import Navbar from "./Navbar";
import { CartProvider } from "./CartContext";
import { OrderProvider } from "./OrderContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <CartProvider>
          <OrderProvider>
            <Navbar />
            {children}
            {/* 🔔 Toast container */}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: "10px",
                  background: "#333",
                  color: "#fff",
                  padding: "12px 16px",
                },
              }}
            />
          </OrderProvider>
        </CartProvider>
      </body>
    </html>
  );
}
