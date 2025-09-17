"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, db, timestamp } from "../../lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // ✅ New state to track order submission

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

      const userPayload = {
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL || "",
        createdAt: timestamp(),
      };

      await setDoc(doc(db, "users", currentUser.uid), userPayload);

      setUser(currentUser);

      toast.dismiss();
      toast.success(`🎉 Welcome, ${currentUser.displayName}!`, {
        icon: "👏",
        style: {
          border: "1px solid #4caf50",
          padding: "12px",
          color: "#fff",
          background: "#4caf50",
          fontWeight: "bold",
        },
      });
    } catch (error) {
      console.error("[Auth] Google sign-in failed", error);
      toast.dismiss();
      toast.error("❌ Google sign-in failed. Please try again.", {
        style: {
          border: "1px solid #f44336",
          padding: "12px",
          color: "#fff",
          background: "#f44336",
          fontWeight: "bold",
        },
      });
    }
  };

  // --- Place Order ---
  const placeOrder = async (
    address,
    billingName,
    billingMobile,
    appliedDiscountPercent = 0
  ) => {
    if (isPlacingOrder) return; // ✅ Prevent multiple submissions
    setIsPlacingOrder(true); // ✅ Start loader state

    try {
      if (!user) {
        return toast.error("🔑 Please sign in to continue!", {
          icon: "🚀",
          style: {
            border: "1px solid #FF4D4F",
            padding: "12px",
            color: "#fff",
            background: "#ff4d4f",
            fontWeight: "bold",
          },
        });
      }

      if (!billingName || !billingMobile || !address) {
        return toast.error("⚠️ Please fill in all required details!", {
          icon: "📝",
          style: {
            border: "1px solid #FF9800",
            padding: "12px",
            color: "#fff",
            background: "linear-gradient(90deg, #ff9800, #ff5722)",
            fontWeight: "bold",
            fontSize: "15px",
          },
        });
      }

      if (!cart || cart.length === 0) {
        return toast.error("🛒 Your cart is empty, add some items first!", {
          icon: "🛍️",
          style: {
            border: "1px solid #2196F3",
            padding: "12px",
            color: "#fff",
            background: "#2196f3",
            fontWeight: "bold",
          },
        });
      }

      const subtotal = getCartTotal();

      // Fetch category-specific discounts (fallback to appliedDiscountPercent)
      let categoryDiscounts = {};
      let globalFlat = 0;
      try {
        const snap = await getDocs(collection(db, "shop"));
        snap.forEach((d) => {
          const data = d.data() || {};
          if (data.CategoryDiscounts && typeof data.CategoryDiscounts === "object") {
            categoryDiscounts = data.CategoryDiscounts || {};
          }
          if (typeof data.DiscountFlat === "number") {
            globalFlat = Math.max(0, Number(data.DiscountFlat) || 0);
          }
        });
      } catch {}

      const normalizePercent = (v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(100, n));
      };
      const globalPct = normalizePercent(appliedDiscountPercent);
      const resolveDiscountForItem = (item) => {
        const cat = item?.category;
        if (!cat) return globalFlat > 0 ? { type: "flat", value: globalFlat } : { type: "percent", value: globalPct };
        const key = String(cat).toLowerCase();
        for (const [k, v] of Object.entries(categoryDiscounts || {})) {
          if (String(k).toLowerCase() === key) {
            if (v && typeof v === "object") {
              if (v.type === "flat") return { type: "flat", value: Math.max(0, Number(v.value) || 0) };
              return { type: "percent", value: normalizePercent(v.value) };
            }
            return { type: "percent", value: normalizePercent(v) };
          }
        }
        return globalFlat > 0 ? { type: "flat", value: globalFlat } : { type: "percent", value: globalPct };
      };

      const itemsWithSnapshot = cart.map((item) => {
        const disc = resolveDiscountForItem(item);
        const unitPrice = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);
        const unitDiscountedPrice = disc.type === "flat"
          ? Math.max(0, unitPrice - Math.min(unitPrice, Number(disc.value) || 0))
          : Math.max(0, unitPrice * (1 - (Number(disc.value) || 0) / 100));
        const lineBaseTotal = unitPrice * quantity;
        const lineDiscountedTotal = Math.max(0, unitDiscountedPrice * quantity);
        return {
          ...item,
          unitPrice,
          unitDiscountedPrice,
          lineBaseTotal,
          lineDiscountedTotal,
          appliedDiscountPercent: disc.type === "percent" ? Number(disc.value) || 0 : 0,
          appliedDiscountFlat: disc.type === "flat" ? Number(disc.value) || 0 : 0,
          appliedDiscountType: disc.type,
        };
      });
      const discountedTotal = itemsWithSnapshot.reduce(
        (sum, it) => sum + Number(it.lineDiscountedTotal || 0),
        0
      );

      if (discountedTotal < 150) {
        return toast.error(
          "🚫 Minimum order value is ₹150, please add more items.",
          {
            icon: "⚡",
            style: {
              border: "1px solid #E91E63",
              padding: "12px",
              color: "#fff",
              background: "linear-gradient(90deg, #e91e63, #9c27b0)",
              fontWeight: "bold",
              fontSize: "15px",
            },
          }
        );
      }

      const orderID = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const getLocation = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      };

      toast.loading("📍 Getting your location…");

      const coords = await getLocation();

      const orderPayload = {
        orderID,
        userId: user.uid,
        name: user.displayName,
        billingName: billingName || null,
        billingMobile: billingMobile || null,
        email: user.email,
        address,
        items: itemsWithSnapshot,
        subtotal,
        appliedDiscountPercent: globalPct,
        discountedTotal,
        total: discountedTotal,
        createdAt: timestamp(),
        location: {
          lat: coords.latitude,
          lng: coords.longitude,
        },
      };

      await addDoc(collection(db, "orders"), orderPayload);

      toast.dismiss();
      toast.success("✅ Order placed successfully!", {
        icon: "🎉",
        style: {
          border: "1px solid #4caf50",
          padding: "12px",
          color: "#fff",
          background: "#4caf50",
          fontWeight: "bold",
        },
      });
      clearCart();
    } catch (error) {
      console.error("[Order] Failed:", error);
      toast.dismiss();
      toast.error("❌ Failed to get location or place order", {
        style: {
          border: "1px solid #f44336",
          padding: "12px",
          color: "#fff",
          background: "#f44336",
          fontWeight: "bold",
        },
      });
    } finally {
      setIsPlacingOrder(false); // ✅ Reset loader state
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
        isPlacingOrder, // ✅ Expose this state for the UI
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
