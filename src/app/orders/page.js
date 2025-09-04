"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import { onAuthChange } from '../../../lib/authClient';
import { collection, query, where, getDocs } from "firebase/firestore";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const userOrders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      userOrders.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return bTime - aTime;
      });
      setAllOrders(userOrders);
      const isSameDay = (ts) => {
        const d = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
        if (!d) return false;
        const now = new Date();
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      };
      const todayOrders = userOrders.filter(o => isSameDay(o.createdAt));
      setOrders(todayOrders.slice(0, 1));
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">Latest Order (Today)</h1>
        {orders.length === 0 ? (
          <div className="text-center">
            <div className="text-8xl text-yellow-400 mb-6">📋</div>
            <h2 className="text-2xl font-bold text-white mb-4">No orders today</h2>
            <p className="text-gray-400 mb-8">Your latest order for today will appear here.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {(() => {
              const order = orders[0];
              const createdStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : (order.createdAt ? new Date(order.createdAt).toLocaleString() : '');
              const status = (order.status || 'pending');
              const statusClass = status === 'accepted' ? 'bg-green-600 text-white' : (status === 'rejected' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black');
              return (
                <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-gray-400 text-sm">Order ID</div>
                      <div className="text-xl font-semibold text-white">{order.orderID || `#${order.id}`}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300 mb-6">
                    <div><span className="text-yellow-400">Name:</span> {order.name}</div>
                    <div><span className="text-yellow-400">Date:</span> {createdStr}</div>
                    <div><span className="text-yellow-400">Total:</span> ₹{order.total}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Items</h3>
                    <div className="space-y-2">
                      {(order.items || []).map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                          <span className="text-white">{i.itemName}</span>
                          <span className="text-yellow-400 font-semibold">Qty: {i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="inline-block bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                {showHistory ? 'Hide history' : 'Show history'}
              </button>
            </div>
            {showHistory && (
              <div className="mt-6 space-y-3">
                {(allOrders || []).map((o) => {
                  const createdStr = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : (o.createdAt ? new Date(o.createdAt).toLocaleString() : '');
                  const status = (o.status || 'pending');
                  const statusClass = status === 'accepted' ? 'bg-green-600 text-white' : (status === 'rejected' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black');
                  return (
                    <div key={o.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-400">{o.orderID || `#${o.id}`}</div>
                          <div className="text-white">{createdStr}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      </div>
                      <div className="mt-3 grid md:grid-cols-3 gap-3 text-sm text-gray-300">
                        <div><span className="text-yellow-400">Name:</span> {o.name}</div>
                        <div><span className="text-yellow-400">Total:</span> ₹{o.total}</div>
                        <div><span className="text-yellow-400">Items:</span> {(o.items || []).length}</div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {(o.items || []).map((i, idx) => (
                                                  <div key={idx} className="flex justify-between text-sm text-gray-300">
                          <span>{i.itemName}</span>
                          <span className="text-yellow-400">Qty: {i.quantity}</span>
                        </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
