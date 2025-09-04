"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from "../../lib/firebase";
import { onAuthChange } from "../../lib/authClient";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthChange((u) => {
      setUserId(u ? u.uid : null);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return bTime - aTime;
      });
      setOrders(list);
    });
    return () => unsub();
  }, [userId]);

  const getOrders = () => orders;
  const getOrderById = (orderId) => orders.find(o => o.id === orderId);
  const getPendingOrdersCount = () => orders.filter(o => (o.status || 'pending') === 'pending').length;
  const getLatestOrder = () => orders[0] || null;

  return (
    <OrderContext.Provider value={{
      orders,
      getOrders,
      getOrderById,
      getPendingOrdersCount,
      getLatestOrder,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
