"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { useOrders } from "./OrderContext";
import AuthForm from "./AuthForm";
import { onAuthChange, getCurrentUser, logOut } from "../../lib/authClient"; // Use logOut

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [user, setUser] = useState(null); // Track user
  const pathname = usePathname();
  const router = useRouter();
  const { getCartCount } = useCart();
  const { getPendingOrdersCount } = useOrders();

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u); // Set user on auth change
      if (u) setShowAuthForm(false);
    });
    // Initial user fetch
    setUser(getCurrentUser && getCurrentUser());
    return () => unsub();
  }, []);

  // Prefetch menu route on home to speed up first navigation
  useEffect(() => {
    if (pathname === "/") {
      try {
        router.prefetch("/menu");
      } catch {}
    }
  }, [pathname, router]);
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }
  const links =
    pathname === "/"
      ? [
          { name: "Home", href: "/" },
          { name: "Menu", href: "/menu" },
          { name: "Party Orders", href: "#party" },
          { name: "Wedding Catering", href: "#wedding" },
          { name: "About", href: "#about" },
          { name: "Contact", href: "#contact" },
        ]
      : [{ name: "Home", href: "/" }];

  return (
    <>
      <nav className="fixed top-0 w-full z-40 backdrop-blur-xl bg-black/30 border-b border-yellow-500/10 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-playfair font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400">
              Asif Bhai's Biryani
            </h1>
          </div>
          <div className="hidden lg:flex items-center space-x-8 text-white">
            {links.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-yellow-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/orders"
              className="text-white hover:text-yellow-400 relative"
              aria-label="Order Tracking"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-6 h-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </Link>
            <Link
              href="/cart"
              className="text-white hover:text-yellow-400 relative"
              aria-label="Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-6 h-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61l1.38-7.39H6.5"></path>
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <span className="text-yellow-400 font-semibold">
                  {user.name || user.displayName}
                </span>
                <button
                  onClick={() => {
                    logOut();
                    setUser(null);
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthForm(true)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all"
              >
                Login
              </button>
            )}
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileOpen(true)}
            >
              <i className="fa-solid fa-bars text-xl" />
            </button>
          </div>
        </div>
      </nav>
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black/90 backdrop-blur-xl z-50 transform ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300`}
      >
        <div className="p-6">
          <button
            className="float-right text-white mb-8"
            onClick={() => setMobileOpen(false)}
          >
            <i className="fa-solid fa-xmark text-xl" />
          </button>

          <div className="space-y-6 mt-16">
            {links.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-white hover:text-yellow-400 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/orders"
              className="block text-white hover:text-yellow-400 transition-colors flex items-center"
              onClick={() => setMobileOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5 mr-3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              Order Tracking
            </Link>
            <Link
              href="/cart"
              className="block text-white hover:text-yellow-400 transition-colors flex items-center"
              onClick={() => setMobileOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5 mr-3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61l1.38-7.39H6.5"></path>
              </svg>
              Cart ({getCartCount()})
            </Link>
            {user ? (
              <>
                <span className="block text-yellow-400 font-semibold">
                  {user.name}
                </span>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logOut();
                    setUser(null);
                  }}
                  className="block text-white hover:text-yellow-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setShowAuthForm(true);
                }}
                className="block text-white hover:text-yellow-400 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
      {showAuthForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black"
            onClick={() => setShowAuthForm(false)}
          ></div>
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <AuthForm onClose={() => setShowAuthForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}
