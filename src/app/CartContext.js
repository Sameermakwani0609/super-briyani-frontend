"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db, timestamp } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState(null); // Store logged-in user

  // Load cart from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Keep user in sync with Firebase Auth state
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
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cart, isClient]);

  // --- Cart functions ---
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
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
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () =>
    cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  // --- Google Sign-In ---
  const signInWithGoogle = async () => {
    try {
      console.log('[Auth] Starting Google sign-in');
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;

      // Save user to Firestore
      const userPayload = {
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL || "",
        createdAt: timestamp(),
      };
      console.log('[Firestore] Writing user doc', { uid: currentUser.uid, userPayload });
      await setDoc(doc(db, "users", currentUser.uid), userPayload);

      setUser(currentUser);
      alert(`Signed in as ${currentUser.displayName}`);
    } catch (error) {
      console.error('[Auth] Google sign-in failed', { code: error.code, message: error.message, stack: error.stack });
      alert("Google sign-in failed!");
    }
  };

  // --- Place Order ---
  const placeOrder = async (address, billingName, billingMobile) => {
    if (!user) return alert("Please sign in first");
    if (!address) return alert("Please enter address");
    if (!cart || cart.length === 0) return alert("Cart is empty");

    const total = getCartTotal();
    const orderID = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
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
      };
      console.log('[Firestore] Creating order', orderPayload);
      await addDoc(collection(db, "orders"), orderPayload);

      alert("Order placed successfully!");
      clearCart(); // clear cart after order
    } catch (error) {
      console.error('[Firestore] Failed to place order', { code: error.code, message: error.message, stack: error.stack });
      alert("Failed to place order!");
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      user,
      signInWithGoogle,
      placeOrder
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
