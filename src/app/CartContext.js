"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, db, timestamp } from "../../lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }, []);

  // Sync user with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cart, isClient]);

  // --- Cart functions ---
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  // --- Google Sign-In ---
  const signInWithGoogle = async () => {
    try {
      toast.loading("Signing you in…");

      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;

      // Save user to Firestore
      const userPayload = {
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL || "",
        createdAt: timestamp(),
      };

      await setDoc(doc(db, "users", currentUser.uid), userPayload);

      setUser(currentUser);

      toast.dismiss(); // remove "loading..."
      toast.success(`Welcome, ${currentUser.displayName}! 🎉`, {
        icon: "👏",
      });
    } catch (error) {
      console.error("[Auth] Google sign-in failed", error);
      toast.dismiss();
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  // --- Place Order ---
  const placeOrder = async (address, billingName, billingMobile) => {
    if (!user) return toast.error("Please sign in first");
    if (!address) return toast.error("Please enter address");
    if (!cart || cart.length === 0) return toast.error("Cart is empty");

    const total = getCartTotal();
    const orderID = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Helper: wrap geolocation in a Promise
    const getLocation = () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    };

    try {
      toast.loading("Getting your location…");

      // ✅ Wait for location
      const coords = await getLocation();

      const orderPayload = {
        orderID,
        userId: user.uid,
        name: user.displayName,
        billingName: billingName || null,
        billingMobile: billingMobile || null,
        email: user.email,
        address,
        items: cart,
        total,
        createdAt: timestamp(),
        location: {
          lat: coords.latitude,
          lng: coords.longitude,
        },
      };

      // Save order in Firestore
      await addDoc(collection(db, "orders"), orderPayload);

      toast.dismiss();
      toast.success("✅ Order placed successfully!");
      clearCart();
    } catch (error) {
      console.error("[Order] Failed:", error);
      toast.dismiss();
      toast.error("❌ Failed to get location or place order");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        user,
        signInWithGoogle,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
