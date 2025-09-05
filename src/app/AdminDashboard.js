"use client";

import { useState, useEffect } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaUtensils,
  FaUserShield,
  FaPlus,
  FaList,
  FaShoppingCart,
  FaSave,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlusCircle,
  FaCheck,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaTag,
} from "react-icons/fa";
import { db } from "../../lib/firebase";
import ImageUploader from "./ImageUploader";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function AdminDashboard() {
  const router = useRouter();
  const todayStr = new Date().toISOString().slice(0, 10);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [nextItemId, setNextItemId] = useState(1);
  const [nextOrderId, setNextOrderId] = useState(1);
  const [activeTab, setActiveTab] = useState("add-item");
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    price: "",
    category: "",
    photoUrl: "",
    description: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    itemName: "",
    price: "",
    category: "",
    photoUrl: "",
    description: "",
  });
  const [shopDocId, setShopDocId] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState(todayStr);
  const [historyDate, setHistoryDate] = useState(todayStr);
  const [adminCity, setAdminCity] = useState("");
  const [adminLat, setAdminLat] = useState(null);
  const [adminLng, setAdminLng] = useState(null);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(10);
  const [locFetching, setLocFetching] = useState(false);
  const [locMessage, setLocMessage] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [citySearching, setCitySearching] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const seenPendingIdsRef = useRef(new Set());
  const initialOrdersLoadRef = useRef(false);
  const isAlertingRef = useRef(false);
  const alertStopRef = useRef(null);
  const audioRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const formatDate = (ts) => {
    if (!ts) return "";
    if (ts?.toDate) return ts.toDate().toLocaleString();
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  };
  useEffect(() => {
    const itemsQuery = query(collection(db, "menuItems"), orderBy("itemName"));
    const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.debug("[AdminDashboard] menuItems snapshot:", items);
      setMenuItems(items);
    });

    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data() || {};
        const rawItems = Array.isArray(data.items) ? data.items : [];
        const normalizedItems = rawItems.map((it) => ({
          ...it,
          itemName: it?.itemName || it?.name || it?.item || "",
          price: it?.price != null ? it.price : it?.rate ?? 0,
          quantity: it?.quantity != null ? it.quantity : it?.qty ?? 0,
        }));
        return { id: d.id, ...data, items: normalizedItems };
      });
      console.debug("[AdminDashboard] orders snapshot (normalized):", list);
      setOrders(list);
    });

    // Fetch shop status (first doc in collection)
    const unsub = onSnapshot(collection(db, "shop"), (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        setShopDocId(snapshot.docs[0].id);
        setIsShopOpen(!!docData.IsOpen);
        if (docData.City) setAdminCity(docData.City);
        if (typeof docData.CityLat === "number") setAdminLat(docData.CityLat);
        if (typeof docData.CityLng === "number") setAdminLng(docData.CityLng);
        if (typeof docData.DeliveryRadiusKm === "number") setDeliveryRadiusKm(docData.DeliveryRadiusKm);
        if (typeof docData.DiscountPercent === "number") setDiscountPercent(docData.DiscountPercent);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeOrders();
      unsub();
    };
  }, []);
  useEffect(() => {
    localStorage.setItem("nextOrderId", nextOrderId.toString());
  }, [nextOrderId]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type, visible: true });
    setTimeout(
      () => setNotification({ message: "", type, visible: false }),
      3000
    );
  };

  const isSameDayAs = (ts, dateStr) => {
    if (!dateStr) return true;
    if (!ts) return false;
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    const [y, m, day] = dateStr.split("-").map((n) => parseInt(n, 10));
    if (!y || !m || !day) return true;
    return (
      d.getFullYear() === y && d.getMonth() + 1 === m && d.getDate() === day
    );
  };

  const playAlertForTenSeconds = () => {
    if (isAlertingRef.current) return;
    // Check if muted (e.g., right after admin login)
    try {
      const mutedUntilStr = localStorage.getItem("alertMutedUntil");
      const mutedUntil = mutedUntilStr ? parseInt(mutedUntilStr, 10) : 0;
      if (mutedUntil && Date.now() < mutedUntil) {
        return; // skip playing sound while muted window is active
      }
    } catch {}
    const audioEl = audioRef.current;
    // If the browser hasn't unlocked audio yet, skip and show enable UI
    if (!soundEnabled) {
      return;
    }
    const startSynthBackup = () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        isAlertingRef.current = true;
        alertStopRef.current = setTimeout(() => {
          try {
            oscillator.stop();
            audioCtx.close();
          } catch {}
          isAlertingRef.current = false;
          alertStopRef.current = null;
        }, 10000);
      } catch {}
    };

    if (audioEl) {
      try {
        audioEl.currentTime = 0;
        audioEl.loop = true;
        const playPromise = audioEl.play();
        isAlertingRef.current = true;
        alertStopRef.current = setTimeout(() => {
          try {
            audioEl.pause();
            audioEl.loop = false;
          } catch {}
          isAlertingRef.current = false;
          alertStopRef.current = null;
        }, 10000);
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch((err) => {
            // Distinguish autoplay vs file/mime errors
            const name = err?.name || "";
            const msg = (err?.message || "").toLowerCase();
            const likelyAutoplay = name === "NotAllowedError" || msg.includes("gesture");
            const mediaUnsupported = name === "NotSupportedError" || msg.includes("unsupported") || msg.includes("decode") || msg.includes("mime");
            const networkIssue = name === "AbortError" || name === "NotFoundError" || msg.includes("network") || msg.includes("404");
            try { if (alertStopRef.current) clearTimeout(alertStopRef.current); } catch {}
            isAlertingRef.current = false;
            if (likelyAutoplay) {
              startSynthBackup();
            } else if (mediaUnsupported || networkIssue) {
              showNotification("Alert sound file error. Check public/receiver.mp3.", "error");
            } else {
              // default: do not spam; attempt silent fallback
              startSynthBackup();
            }
          });
        }
      } catch {
        isAlertingRef.current = false;
        // Don't fallback to synth if file is bad; only on runtime errors
        try {
          showNotification("Could not play alert sound.", "error");
        } catch {}
      }
    } else {
      startSynthBackup();
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error("reverse geocode failed");
      const data = await res.json();
      const addr = data?.address || {};
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || addr.state || "";
      return city;
    } catch {
      return "";
    }
  };

  const detectAndSetMyCity = async () => {
    setLocMessage("");
    setLocFetching(true);
    const insecure = typeof window !== "undefined" && !window.isSecureContext;
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation API not supported by this browser");
      }
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      }).then(async (pos) => {
        const { latitude, longitude } = (pos || {}).coords || {};
        if (typeof latitude !== "number" || typeof longitude !== "number") {
          throw new Error("Invalid coordinates");
        }
        setAdminLat(latitude);
        setAdminLng(longitude);
        const name = await reverseGeocode(latitude, longitude);
        if (name) {
          setAdminCity(name);
          setLocMessage(`Detected: ${name}`);
          showNotification(`Detected city: ${name}`);
        } else {
          setAdminCity(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocMessage("Detected coordinates; city unknown");
          showNotification("Detected location; enter city if needed", "info");
        }
      });
    } catch (e) {
      // Fallback to IP-based approximate location
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const ip = await res.json();
          const ipLat = Number(ip.latitude);
          const ipLon = Number(ip.longitude);
          const cityName = ip.city || ip.region || "";
          if (Number.isFinite(ipLat) && Number.isFinite(ipLon)) {
            setAdminLat(ipLat);
            setAdminLng(ipLon);
            if (cityName) setAdminCity(cityName);
            setLocMessage(cityName ? `Approximate: ${cityName}` : "Approximate location set");
            showNotification("Approximate location set (IP based)", "info");
            setLocFetching(false);
            return;
          }
        }
      } catch {}
      const hint = insecure ? " Location requires HTTPS or localhost." : "";
      setLocMessage("Could not get location." + hint);
      showNotification("Could not get location" + hint, "error");
    } finally {
      setLocFetching(false);
    }
  };

  const saveAdminCity = async () => {
    try {
      if (!shopDocId) return;
      await updateDoc(doc(db, "shop", shopDocId), {
        City: adminCity || null,
        CityLat: typeof adminLat === "number" ? adminLat : null,
        CityLng: typeof adminLng === "number" ? adminLng : null,
        DeliveryRadiusKm: Number.isFinite(Number(deliveryRadiusKm)) ? Number(deliveryRadiusKm) : 10,
        CityUpdatedAt: new Date().toISOString(),
      });
      showNotification("Location and radius saved");
    } catch {
      showNotification("Failed to save location/radius", "error");
    }
  };

  const saveDiscount = async () => {
    try {
      if (!shopDocId) return;
      const pct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
      await updateDoc(doc(db, "shop", shopDocId), {
        DiscountPercent: pct,
        DiscountUpdatedAt: new Date().toISOString(),
      });
      setDiscountPercent(pct);
      showNotification("Discount saved");
    } catch {
      showNotification("Failed to save discount", "error");
    }
  };

  const searchCity = async (q) => {
    const query = (q || "").trim();
    setCityQuery(query);
    setCityResults([]);
    if (!query || query.length < 2) return;
    setCitySearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&city=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      const mapped = (data || []).map((it) => ({
        display: it.display_name,
        lat: Number(it.lat),
        lon: Number(it.lon),
        raw: it,
      }));
      setCityResults(mapped);
    } catch {
      setCityResults([]);
    } finally {
      setCitySearching(false);
    }
  };

  // Unlock audio on first interaction
  useEffect(() => {
    const markEnabled = () => {
      try { localStorage.setItem("soundUnlocked", "true"); } catch {}
      setSoundEnabled(true);
    };
    const tryAutoUnlock = async () => {
      const audioEl = audioRef.current;
      if (!audioEl) return;
      try {
        audioEl.volume = 0.6;
        const p = audioEl.play();
        if (p && typeof p.then === "function") {
          await p;
        }
        audioEl.pause();
        markEnabled();
      } catch {
        // Autoplay blocked; wait for user gesture
        const handler = async () => {
          try {
            const p2 = audioEl.play();
            if (p2 && typeof p2.then === "function") {
              await p2;
            }
            audioEl.pause();
            window.removeEventListener("pointerdown", handler);
            markEnabled();
          } catch {}
        };
        window.addEventListener("pointerdown", handler, { once: true });
      }
    };
    try {
      const unlocked = localStorage.getItem("soundUnlocked") === "true";
      if (unlocked) {
        setSoundEnabled(true);
      } else {
        tryAutoUnlock();
      }
    } catch {
      tryAutoUnlock();
    }
  }, []);

  const enableSoundNow = async () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    try {
      audioEl.volume = 0.6;
      const p = audioEl.play();
      if (p && typeof p.then === "function") await p;
      audioEl.pause();
      try { localStorage.setItem("soundUnlocked", "true"); } catch {}
      setSoundEnabled(true);
      showNotification("Sound enabled for new orders", "success");
    } catch {
      showNotification("Tap the page to enable sound.", "error");
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const pendingToday = (orders || [])
      .filter((o) => (o.status || "pending") === "pending")
      .filter((o) => isSameDayAs(o.createdAt, today));

    const currentIds = new Set(pendingToday.map((o) => o.id));
    // Detect newly added ids compared to previous snapshot
    let hasNew = false;
    currentIds.forEach((id) => {
      if (!seenPendingIdsRef.current.has(id)) hasNew = true;
    });

    // Update seen set
    seenPendingIdsRef.current = currentIds;

    // Skip alert on very first load to avoid false positives
    if (!initialOrdersLoadRef.current) {
      initialOrdersLoadRef.current = true;
      return;
    }

    if (hasNew) {
      playAlertForTenSeconds();
    }
  }, [orders]);
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        itemName: formData.itemName,
        price: parseFloat(formData.price || 0),
        category: formData.category,
        photoUrl: formData.photoUrl,
        description: formData.description,
      };
      await addDoc(collection(db, "menuItems"), payload);
      setFormData({
        itemName: "",
        price: "",
        category: "",
        photoUrl: "",
        description: "",
      });
      showNotification("Menu item added successfully!");
    } catch (error) {
      console.error("[AdminDashboard] Failed to add item:", error);
      showNotification("Failed to add item", "error");
    }
  };
  const openEditModal = (item) => {
    setEditItem(item);
    setEditFormData({
      id: item.id,
      itemName: item.itemName || "",
      price: item.price ?? "",
      category: item.category || "",
      photoUrl: item.photoUrl || "",
      description: item.description || "",
    });
    setEditModalOpen(true);
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, "menuItems", editFormData.id);
      await updateDoc(ref, {
        itemName: editFormData.itemName,
        price: parseFloat(editFormData.price || 0),
        category: editFormData.category,
        photoUrl: editFormData.photoUrl,
        description: editFormData.description,
      });
      setEditModalOpen(false);
      showNotification("Item updated successfully!");
    } catch (error) {
      console.error("[AdminDashboard] Failed to update item:", error);
      showNotification("Failed to update item", "error");
    }
  };

  const handleDeleteItem = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "menuItems", id));
        showNotification("Item deleted successfully!");
      } catch (error) {
        console.error("[AdminDashboard] Failed to delete item:", error);
        showNotification("Failed to delete item", "error");
      }
    }
  };

  const sendWhatsAppMessage = async (mobileNumber, message) => {
    try {
      // Remove any non-digit characters from mobile number
      const cleanNumber = mobileNumber.replace(/\D/g, '');
      
      // Add country code if not present (assuming India +91)
      const phoneNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      return false;
    }
  };

  const acceptOrder = async (id) => {
    try {
      const order = orders.find(o => o.id === id);
      if (!order) {
        showNotification("Order not found", "error");
        return;
      }

      await updateDoc(doc(db, "orders", id), { status: "accepted" });
      
      // Send WhatsApp notification
      if (order.billingMobile) {
        const orderDetails = order.items?.map(item => 
          `• ${item.itemName || item.name || 'Unnamed item'} - ₹${Number(item.price || 0).toFixed(2)} × ${item.quantity || 0} = ₹${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}`
        ).join('\n') || 'No items';
        
        const total = order.total || order.items?.reduce((sum, item) => 
          sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0) || 0;
        
        const message = `🍽️ *Asif's Briyani - Order Accepted!* 🎉

*Order ID:* ${order.orderID || `#${id}`}
*Status:* ✅ ACCEPTED

*Order Details:*
${orderDetails}

*Total Amount:* ₹${Number(total).toFixed(2)}
*Customer Name:* ${order.billingName || order.name}
*Delivery Address:* ${order.address}

*Order Time:* ${formatDate(order.createdAt)}

Thank you for choosing Asif's Briyani! Your order is being prepared and will be delivered soon. 🚚

For any queries, contact us at our restaurant.`;

        await sendWhatsAppMessage(order.billingMobile, message);
      }
      
      showNotification("Order accepted and WhatsApp notification sent!");
    } catch (e) {
      console.error("[AdminDashboard] Failed to accept order:", e);
      showNotification("Failed to accept order", "error");
    }
  };

  const rejectOrder = async (id) => {
    if (confirm("Are you sure you want to reject this order?")) {
      try {
        const order = orders.find(o => o.id === id);
        if (!order) {
          showNotification("Order not found", "error");
          return;
        }

        await updateDoc(doc(db, "orders", id), { status: "rejected" });
        
        // Send WhatsApp notification
        if (order.billingMobile) {
          const message = `🍽️ *Asif's Briyani - Order Update* 

*Order ID:* ${order.orderID || `#${id}`}
*Status:* ❌ REJECTED

Dear ${order.billingName || order.name},

We regret to inform you that your order has been rejected. This could be due to:
• Item unavailability
• Delivery area restrictions
• Restaurant capacity

*Order Details:*
• Order Time: ${formatDate(order.createdAt)}
• Delivery Address: ${order.address}

We apologize for any inconvenience caused. Please feel free to place a new order or contact us for assistance.

Thank you for considering Asif's Briyani! 🙏`;

          await sendWhatsAppMessage(order.billingMobile, message);
        }
        
        showNotification("Order rejected and WhatsApp notification sent!");
      } catch (e) {
        console.error("[AdminDashboard] Failed to reject order:", e);
        showNotification("Failed to reject order", "error");
      }
    }
  };

  return (
    <div className="min-h-screen h-screen w-full bg-gradient-to-br from-black to-gray-900 text-white overflow-auto">
      <audio
        ref={audioRef}
        src="/receiver.mp3?v=1"
        preload="auto"
        onError={() => {
          try {
            // simple cache-bust retry once
            if (audioRef.current) {
              const el = audioRef.current;
              const url = `/receiver.mp3?v=${Date.now()}`;
              el.setAttribute("src", url);
              el.load();
            }
          } catch {}
        }}
      />
      {/* Notification */}
      {notification.visible && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-md font-semibold transition-transform ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}
      <header className="bg-gradient-to-br from-yellow-400 to-yellow-300 text-black p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaUtensils className="text-2xl" />
            <h1 className="text-2xl font-bold">Super Briyani Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <FaUserShield className="text-xl" />
            <span className="font-semibold">Administrator</span>
            <button
              onClick={() => {
                try { localStorage.removeItem("isAdminAuthed"); } catch {}
                router.push("/adminlogin");
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
        {/* Shop Open Toggle */}
        <div className="flex items-center justify-end mt-4">
          <span className="mr-3 font-semibold text-lg">
            Shop Status:
            <span
              className={
                isShopOpen ? "text-green-700 ml-2" : "text-red-700 ml-2"
              }
            >
              {isShopOpen ? "Open" : "Closed"}
            </span>
          </span>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isShopOpen}
                onChange={async (e) => {
                  if (!shopDocId) return;
                  const newStatus = e.target.checked;
                  setIsShopOpen(newStatus);
                  await updateDoc(doc(db, "shop", shopDocId), {
                    IsOpen: newStatus,
                  });
                  showNotification(
                    `Shop is now ${newStatus ? "Open" : "Closed"}`
                  );
                }}
                className="sr-only"
              />
              <div
                className={`block w-14 h-8 rounded-full ${
                  isShopOpen ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                  isShopOpen ? "translate-x-6" : ""
                }`}
              ></div>
            </div>
            <span className="ml-3 text-black font-bold">
              {isShopOpen ? "Open" : "Closed"}
            </span>
          </label>
        </div>
      </header>
      <nav className="bg-gray-900 border-b border-yellow-500">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "add-item"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("add-item")}
            >
              <FaPlus className="mr-2" />
              Add Item
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "view-items"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("view-items")}
            >
              <FaList className="mr-2" />
              View Items
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "orders"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <FaShoppingCart className="mr-2" />
              Pending Orders
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "history"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <FaList className="mr-2" />
              Order History
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "locations"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("locations")}
            >
              <FaMapMarkerAlt className="mr-2" />
              Locations
            </button>
            <button
              className={`px-6 py-3 font-semibold transition-all duration-200 flex items-center ${
                activeTab === "discount"
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-300 text-black"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              onClick={() => setActiveTab("discount")}
            >
              <FaTag className="mr-2" />
              Discount
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {activeTab === "add-item" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-8 border border-yellow-500 shadow-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center flex items-center justify-center">
                <FaPlusCircle className="mr-2" />
                Add New Menu Item
              </h2>
              <form className="space-y-6" onSubmit={handleAddItem}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-yellow-400 font-semibold mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                      value={formData.itemName}
                      onChange={(e) =>
                        setFormData({ ...formData, itemName: e.target.value })
                      }
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-yellow-400 font-semibold mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={formData.photoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, photoUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="mt-3">
                    <ImageUploader
                      buttonLabel="Upload Image to Cloudinary"
                      onUploadComplete={(url) => setFormData({ ...formData, photoUrl: url })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter item description"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-br from-yellow-400 to-yellow-300 text-black py-3 rounded-lg font-bold flex items-center justify-center transition-all duration-200 hover:shadow-lg"
                >
                  <FaSave className="mr-2" />
                  Add Item
                </button>
              </form>
            </div>
          </div>
        )}
        {activeTab === "view-items" && (
          <div className="bg-gray-900 rounded-lg border border-yellow-500 shadow-lg overflow-x-auto">
            <table className="w-full text-white">
              <thead className="bg-yellow-400 text-black">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Image</th>
                  <th className="px-6 py-4 text-left font-bold">Name</th>
                  <th className="px-6 py-4 text-left font-bold">Category</th>
                  <th className="px-6 py-4 text-left font-bold">Price</th>
                  <th className="px-6 py-4 text-left font-bold">Description</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      <FaUtensils className="text-4xl mb-2 mx-auto" />
                      <p>No menu items found. Add some items to get started!</p>
                    </td>
                  </tr>
                ) : (
                  menuItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      <td className="px-6 py-4">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.itemName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                            <FaUtensils className="text-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-400 text-black">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-yellow-400">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                        {item.description || "No description"}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <label className="mr-3 text-yellow-400 font-semibold">Filter by date</label>
              <input
                type="date"
                value={pendingDate}
                onChange={(e) => setPendingDate(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
              />
            </div>
            {orders
              .filter((o) => (o.status || "pending") === "pending")
              .filter((o) => isSameDayAs(o.createdAt, pendingDate))
              .length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaShoppingCart className="text-4xl mb-2 mx-auto" />
                <p>
                  No orders found. Orders will appear here when customers place
                  them.
                </p>
              </div>
            ) : (
              orders
                .filter((o) => (o.status || "pending") === "pending")
                .filter((o) => isSameDayAs(o.createdAt, pendingDate))
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors"
                  >
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400">
                          {order.orderID || `Order #${order.id}`}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptOrder(order.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          <FaCheck className="mr-2" /> Accept
                        </button>
                        <button
                          onClick={() => rejectOrder(order.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center"
                        >
                          <FaTimes className="mr-2" /> Reject
                        </button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">
                          Customer Information
                        </h4>
                        <p className="text-white">
                          <strong>Name:</strong> {order.billingName || order.name}
                        </p>
                        <p className="text-gray-300 mt-1">
                          <strong>Mobile:</strong> {order.billingMobile || '—'}
                        </p>
                        <p className="text-gray-300 mt-2">
                          <strong>Address:</strong> {order.address}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">
                          Order Items
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((i, idx) => {
                            const itemPrice = Number(i.price || 0);
                            const qty = Number(i.quantity || 0);
                            const itemTotal = itemPrice * qty;
                            return (
                              <div
                                key={idx}
                                className="flex justify-between items-center bg-gray-700 p-3 rounded"
                              >
                                <div className="flex-1">
                                  <span className="text-white font-semibold">
                                    {i.itemName || i.name || "Unnamed item"}
                                  </span>
                                  <div className="text-sm text-gray-300">
                                    <span>
                                      ₹{itemPrice.toFixed(2)} × {qty}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-yellow-400 font-bold">
                                  ₹{itemTotal.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-600">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold text-lg">Total:</span>
                            {(() => {
                              const pct = Number(discountPercent) || 0;
                              const baseTotal = order.total != null
                                ? Number(order.total)
                                : (order.items || []).reduce(
                                    (total, it) => total + Number(it.price || 0) * Number(it.quantity || 0),
                                    0
                                  );
                              const discounted = Math.max(0, baseTotal * (1 - pct / 100));
                              return pct > 0 ? (
                                <div className="text-right">
                                  <div className="text-gray-400 line-through">₹{baseTotal.toFixed(2)}</div>
                                  <div className="text-yellow-400 font-bold text-xl">₹{discounted.toFixed(2)} <span className="text-xs text-green-400">({pct}% off)</span></div>
                                </div>
                              ) : (
                                <span className="text-yellow-400 font-bold text-xl">₹{baseTotal.toFixed(2)}</span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="mr-3 text-yellow-400 font-semibold">Filter by date</label>
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
              />
            </div>
            {orders
              .filter((o) => (o.status || "pending") !== "pending")
              .filter((o) => isSameDayAs(o.createdAt, historyDate))
              .length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaList className="text-4xl mb-2 mx-auto" />
                <p>No order history yet.</p>
              </div>
            ) : (
              orders
                .filter((o) => (o.status || "pending") !== "pending")
                .filter((o) => isSameDayAs(o.createdAt, historyDate))
                .map((order) => {
                  const status = order.status || "pending";
                  const badge =
                    status === "accepted"
                      ? "bg-green-600 text-white"
                      : status === "rejected"
                      ? "bg-red-600 text-white"
                      : "bg-yellow-400 text-black";
                  return (
                    <div
                      key={order.id}
                      className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors"
                    >
                      <div className="flex justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-yellow-400">
                            {order.orderID || `Order #${order.id}`}
                          </h3>
                          <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-2">Customer Information</h4>
                          <p className="text-white">
                            <strong>Name:</strong> {order.billingName || order.name}
                          </p>
                          <p className="text-gray-300 mt-1">
                            <strong>Mobile:</strong> {order.billingMobile || '—'}
                          </p>
                          <p className="text-gray-300 mt-2">
                            <strong>Address:</strong> {order.address}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-2">Order Items</h4>
                          <div className="space-y-2">
                            {order.items?.map((i, idx) => {
                              const itemPrice = Number(i.price || 0);
                              const qty = Number(i.quantity || 0);
                              const itemTotal = itemPrice * qty;
                              return (
                                <div key={idx} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                                  <div className="flex-1">
                                    <span className="text-white font-semibold">{i.itemName || i.name || "Unnamed item"}</span>
                                    <div className="text-sm text-gray-300">
                                      <span>₹{itemPrice.toFixed(2)} × {qty}</span>
                                    </div>
                                  </div>
                                  <span className="text-yellow-400 font-bold">₹{itemTotal.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-600">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-semibold text-lg">Total:</span>
                              {(() => {
                                const pct = Number(discountPercent) || 0;
                                const baseTotal = order.total != null
                                  ? Number(order.total)
                                  : (order.items || []).reduce(
                                      (total, it) => total + Number(it.price || 0) * Number(it.quantity || 0),
                                      0
                                    );
                                const discounted = Math.max(0, baseTotal * (1 - pct / 100));
                                return pct > 0 ? (
                                  <div className="text-right">
                                    <div className="text-gray-400 line-through">₹{baseTotal.toFixed(2)}</div>
                                    <div className="text-yellow-400 font-bold text-xl">₹{discounted.toFixed(2)} <span className="text-xs text-green-400">({pct}% off)</span></div>
                                  </div>
                                ) : (
                                  <span className="text-yellow-400 font-bold text-xl">₹{baseTotal.toFixed(2)}</span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}
        {activeTab === "locations" && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500 shadow-lg">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Service Area</h3>
              <p className="text-gray-300 mb-4">Step 1: Fetch current location (hotel). Step 2: Set delivery distance (km).</p>
              <div className="mb-4">
                <label className="block text-yellow-400 font-semibold mb-2">Search city (optional)</label>
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => searchCity(e.target.value)}
                  placeholder="Start typing e.g. Pune"
                  className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
                />
                {citySearching && (
                  <div className="text-xs text-gray-400 mt-1">Searching…</div>
                )}
                {cityResults.length > 0 && (
                  <div className="mt-2 bg-gray-800 border border-gray-700 rounded max-h-48 overflow-auto">
                    {cityResults.map((c, idx) => (
                      <button
                        key={`${c.lat}-${c.lon}-${idx}`}
                        type="button"
                        onClick={() => {
                          setAdminLat(c.lat);
                          setAdminLng(c.lon);
                          setAdminCity(c.display);
                          setCityResults([]);
                          setCityQuery(c.display);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-white"
                      >
                        {c.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={detectAndSetMyCity}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
                >
                  {locFetching ? "Fetching..." : "Fetch current location"}
                </button>
                <div className="text-sm text-gray-300">
                  {typeof adminLat === "number" && typeof adminLng === "number"
                    ? `Lat: ${adminLat.toFixed(5)}, Lng: ${adminLng.toFixed(5)}`
                    : "(not set)"}
                </div>
              </div>
              {locMessage && (
                <div className="text-xs text-gray-400 mb-2">{locMessage}</div>
              )}
              <div className="max-w-sm">
                <label className="block text-yellow-400 font-semibold mb-2">Delivery radius (km)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={deliveryRadiusKm}
                  onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                  placeholder="10"
                  className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
                />
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={saveAdminCity}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "discount" && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500 shadow-lg max-w-md">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Global Discount</h3>
              <p className="text-gray-300 mb-4">Set a percentage discount applied to all items for users.</p>
              <label className="block text-yellow-400 font-semibold mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
              />
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveDiscount}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded font-semibold"
                >
                  Save
                </button>
                <span className="text-sm text-gray-400">Current: {Number(discountPercent) || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {editModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={(e) =>
            e.target === e.currentTarget && setEditModalOpen(false)
          }
        >
          <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 border border-yellow-500">
            <h3 className="text-xl font-bold text-yellow-400 mb-6">
              Edit Menu Item
            </h3>
            <form onSubmit={handleEditItem} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={editFormData.itemName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        itemName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">
                  Category
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Biryani">Biryani</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">
                  Photo URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                  value={editFormData.photoUrl}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      photoUrl: e.target.value,
                    })
                  }
                />
                <div className="mt-3">
                  <ImageUploader
                    buttonLabel="Upload New Image"
                    onUploadComplete={(url) =>
                      setEditFormData({ ...editFormData, photoUrl: url })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-br from-yellow-400 to-yellow-300 text-black py-3 rounded-lg font-bold transition-all duration-200 flex justify-center items-center"
                >
                  <FaSave className="mr-2" /> Update Item
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all duration-200 flex justify-center items-center"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
