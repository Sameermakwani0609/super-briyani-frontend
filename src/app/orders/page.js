"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import { onAuthChange } from '../../../lib/authClient';
import { collection, query, where, getDocs } from "firebase/firestore";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [historyDate, setHistoryDate] = useState(todayStr);
  const [historyResults, setHistoryResults] = useState([]);

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'shop'));
        let pct = 0;
        snap.forEach((d) => {
          const data = d.data() || {};
          if (typeof data.DiscountPercent === 'number') pct = data.DiscountPercent;
        });
        setDiscountPercent(pct);
      } catch {}
    })();
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
      setOrders(todayOrders);
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white py-10 sm:py-20">
      <div className="container mx-auto px-2 sm:px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-6 sm:mb-8 text-center">
          Today&apos;s Orders
        </h1>
        {orders.length === 0 ? (
          <div className="text-center">
            <div className="text-7xl sm:text-8xl text-yellow-400 mb-6">📋</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">No orders today</h2>
            <p className="text-gray-400 mb-8 text-sm sm:text-base">Your orders for today will appear here.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {orders.map((order) => {
              const createdStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : (order.createdAt ? new Date(order.createdAt).toLocaleString() : '');
              const status = (order.status || 'pending');
              const statusClass = status === 'accepted' ? 'bg-green-600 text-white' : (status === 'rejected' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black');
              const baseTotal = order.total != null ? Number(order.total) : (order.items || []).reduce((t, it) => t + Number(it.price || 0) * Number(it.quantity || 0), 0);
              const pct = Number(discountPercent) || 0;
              const discounted = Math.max(0, baseTotal * (1 - pct/100));
              return (
                <div key={order.id} className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-yellow-500">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <div className="text-gray-400 text-xs sm:text-sm">Order ID</div>
                      <div className="text-lg sm:text-xl font-semibold text-white">{order.orderID || `#${order.id}`}</div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${statusClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 mb-6">
                    <div><span className="text-yellow-400">Name:</span> {order.name}</div>
                    <div><span className="text-yellow-400">Date:</span> {createdStr}</div>
                    <div className="text-right md:text-left">
                      <span className="text-yellow-400">Total:</span>
                      {pct > 0 ? (
                        <span> <span className="line-through text-gray-400 mr-1">₹{baseTotal.toFixed(2)}</span> <span className="text-yellow-400 font-semibold">₹{discounted.toFixed(2)}</span> <span className="text-green-400 text-xs">({pct}% off)</span></span>
                      ) : (
                        <span> ₹{baseTotal.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">Items</h3>
                    <div className="space-y-2">
                      {(order.items || []).map((i, idx) => {
                        const unit = Number(i.price || 0);
                        const qty = Number(i.quantity || 0);
                        const lineBase = unit * qty;
                        const lineDisc = Math.max(0, lineBase * (1 - (Number(discountPercent)||0)/100));
                        const hasDisc = (Number(discountPercent)||0) > 0 && lineDisc !== lineBase;
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 p-2 sm:p-3 rounded">
                            <div className="text-white">
                              <div className="font-semibold text-sm sm:text-base">{i.itemName}</div>
                              <div className="text-xs text-gray-300">₹{unit.toFixed(2)} × {qty}</div>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                              {hasDisc ? (
                                <div>
                                  <div className="text-gray-400 line-through text-xs">₹{lineBase.toFixed(2)}</div>
                                  <div className="text-yellow-400 font-semibold text-sm">₹{lineDisc.toFixed(2)}</div>
                                </div>
                              ) : (
                                <div className="text-yellow-400 font-semibold text-sm">₹{lineBase.toFixed(2)}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="max-w-3xl mx-auto mt-10">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full sm:w-auto"
            />
            <button
              onClick={() => {
                const [y,m,d] = historyDate.split('-').map(n=>parseInt(n,10));
                const matches = (ts) => {
                  const dt = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
                  if (!dt) return false;
                  return dt.getFullYear()===y && (dt.getMonth()+1)===m && dt.getDate()===d;
                };
                setHistoryResults(allOrders.filter(o => matches(o.createdAt)));
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded font-semibold w-full sm:w-auto"
            >
              Search history
            </button>
          </div>
          {historyResults.length > 0 && (
            <div className="space-y-4">
              {historyResults.map((o) => {
                const createdStr = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : (o.createdAt ? new Date(o.createdAt).toLocaleString() : '');
                const status = (o.status || 'pending');
                const statusClass = status === 'accepted' ? 'bg-green-600 text-white' : (status === 'rejected' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black');
                const baseTotal = o.total != null ? Number(o.total) : (o.items || []).reduce((t, it) => t + Number(it.price || 0) * Number(it.quantity || 0), 0);
                const pct = Number(discountPercent) || 0;
                const discounted = Math.max(0, baseTotal * (1 - pct/100));
                return (
                  <div key={o.id} className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-400">{o.orderID || `#${o.id}`}</div>
                        <div className="text-white text-xs sm:text-base">{createdStr}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300">
                      <div><span className="text-yellow-400">Name:</span> {o.name}</div>
                      <div className="text-right md:text-left">
                        <span className="text-yellow-400">Total:</span>
                        {pct > 0 ? (
                          <span> <span className="line-through text-gray-400 mr-1">₹{baseTotal.toFixed(2)}</span> <span className="text-yellow-400 font-semibold">₹{discounted.toFixed(2)}</span> <span className="text-green-400 text-xs">({pct}% off)</span></span>
                        ) : (
                          <span> ₹{baseTotal.toFixed(2)}</span>
                        )}
                      </div>
                      <div><span className="text-yellow-400">Items:</span> {(o.items || []).length}</div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {(o.items || []).map((i, idx) => {
                        const unit = Number(i.price || 0);
                        const qty = Number(i.quantity || 0);
                        const lineBase = unit * qty;
                        const lineDisc = Math.max(0, lineBase * (1 - pct/100));
                        const hasDisc = pct > 0 && lineDisc !== lineBase;
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 p-2 rounded text-xs sm:text-sm text-gray-300">
                            <div>
                              <div className="text-white font-medium">{i.itemName}</div>
                              <div className="text-xs text-gray-400">₹{unit.toFixed(2)} × {qty}</div>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                              {hasDisc ? (
                                <div>
                                  <div className="line-through text-gray-400">₹{lineBase.toFixed(2)}</div>
                                  <div className="text-yellow-400 font-semibold">₹{lineDisc.toFixed(2)}</div>
                                </div>
                              ) : (
                                <div className="text-yellow-400 font-semibold">₹{lineBase.toFixed(2)}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
