// app/layout.js
import "../styles/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/playfair-display/400.css";
import Navbar from "./Navbar";
import { CartProvider } from "./CartContext";
import { OrderProvider } from "./OrderContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <CartProvider>
          <OrderProvider>
            <Navbar />
            {children}
          </OrderProvider>
        </CartProvider>
      </body>
    </html>
  );
}
