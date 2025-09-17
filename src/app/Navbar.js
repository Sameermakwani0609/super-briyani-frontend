"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { useOrders } from "./OrderContext";
import AuthForm from "./AuthForm";
import { onAuthChange, getCurrentUser, logOut } from "../../lib/authClient";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { getCartCount } = useCart();
  const { getPendingOrdersCount } = useOrders();

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      if (u) setShowAuthForm(false);
    });
    setUser(getCurrentUser && getCurrentUser());
    return () => unsub();
  }, []);

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

  // ✅ Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTop = 0; // Safari fallback
    document.documentElement.scrollTop = 0; // Chrome/Firefox fallback
  };

  // ✅ Handle logo click
  const handleLogoClick = () => {
    if (pathname === "/") {
      scrollToTop();
    } else {
      router.push("/");
      setTimeout(() => scrollToTop(), 300);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-40 backdrop-blur-xl bg-black/30 border-b border-yellow-500/10 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1
              className="cursor-pointer text-xl sm:text-2xl font-playfair font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"
              onClick={handleLogoClick}
            >
              Asif Bhai&apos;s Biryani
            </h1>
          </div>

          {/* Desktop Links */}
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

          {/* Right Side Icons + Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4">
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
              <span className="text-yellow-400 font-semibold hidden lg:block">
                {user.name || user.displayName}
              </span>
            ) : null}

            {user ? (
              <button
                onClick={() => {
                  logOut();
                  setUser(null);
                }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all hidden lg:block"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setShowAuthForm(true)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-400/25 transition-all hidden lg:block"
              >
                Login
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              className="block lg:hidden text-yellow-400 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-black/90 backdrop-blur-xl z-50 transform ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300`}
        style={{ maxWidth: "100vw" }}
      >
        <div className="p-6">
          <button
            className="float-right text-white mb-8 p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
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

      {/* Auth Modal */}
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
