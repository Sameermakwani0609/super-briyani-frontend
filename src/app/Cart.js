"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "./CartContext";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaUser,
  FaMobileAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
    user,
    signInWithGoogle,
    placeOrder,
  } = useCart();
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    mobile: "",
    address: "",
  });
  const [outOfRange, setOutOfRange] = useState(false);
  const [lastDistanceKm, setLastDistanceKm] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [adminCenter, setAdminCenter] = useState({
    lat: 20.491026,
    lng: 77.866386,
  });
  const [adminRadiusKm, setAdminRadiusKm] = useState(10);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFlat, setDiscountFlat] = useState(0);
  const [categoryDiscounts, setCategoryDiscounts] = useState({});

  // NEW: Alert state
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snapshot = await getDocs(collection(db, "shop"));
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() || {};
          if (
            typeof data.CityLat === "number" &&
            typeof data.CityLng === "number"
          ) {
            setAdminCenter({ lat: data.CityLat, lng: data.CityLng });
          }
          if (typeof data.DeliveryRadiusKm === "number") {
            setAdminRadiusKm(data.DeliveryRadiusKm);
          }
          if (typeof data.DiscountPercent === "number") {
            setDiscountPercent(data.DiscountPercent);
          }
          // Flat discount removed from usage; kept for backward compatibility
          if (data.CategoryDiscounts && typeof data.CategoryDiscounts === "object") {
            setCategoryDiscounts(data.CategoryDiscounts || {});
          }
        }
      } catch {
        // ignore and keep defaults
      }
    })();
  }, []);

  const getDiscountForCategory = (category) => {
    const global = { type: "percent", value: Math.max(0, Math.min(100, Number(discountPercent) || 0)) };
    if (!category) return global;
    const key = String(category).toLowerCase();
    for (const [catKey, val] of Object.entries(categoryDiscounts || {})) {
      if (String(catKey).toLowerCase() === key) {
        if (val && typeof val === "object") {
          if (val.type === "flat") return { type: "percent", value: 0 };
          return { type: "percent", value: Math.max(0, Math.min(100, Number(val.value) || 0)) };
        }
        const n = Number(val);
        if (Number.isFinite(n)) return { type: "percent", value: Math.max(0, Math.min(100, n)) };
      }
    }
    return global;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showCustomAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCurrentPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });

  const handlePlaceOrder = async () => {
    if (
      !billingDetails.name ||
      !billingDetails.mobile ||
      !billingDetails.address
    ) {
      showCustomAlert("⚠️ Please fill in all billing details!");
      return;
    }

    if (cart.length === 0) {
      showCustomAlert("🛒 Your cart is empty!");
      return;
    }

    if (!user) {
      showCustomAlert("👤 Please sign in with Google first!");
      return;
    }

    try {
      const HOTEL_LAT = adminCenter.lat;
      const HOTEL_LNG = adminCenter.lng;
      const MAX_KM = adminRadiusKm;

      try {
        const pos = await getCurrentPosition();
        const { latitude, longitude } = pos.coords || {};
        if (typeof latitude === "number" && typeof longitude === "number") {
          const distanceKm = getDistanceKm(
            latitude,
            longitude,
            HOTEL_LAT,
            HOTEL_LNG
          );
          if (distanceKm > MAX_KM) {
            setOutOfRange(true);
            setLastDistanceKm(distanceKm);
            return;
          }
        }
      } catch (geoErr) {
        showCustomAlert(
          "📍 We couldn't verify your location. Please enable location access."
        );
        return;
      }

      await placeOrder(
        billingDetails.address,
        billingDetails.name,
        billingDetails.mobile,
        discountPercent
      );
      setBillingDetails({ name: "", mobile: "", address: "" });
      setOutOfRange(false);
      setLastDistanceKm(null);
    } catch (e) {
      // placeOrder already alerts on failure
    }
  };

  const tryUseCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const HOTEL_LAT = adminCenter.lat;
      const HOTEL_LNG = adminCenter.lng;
      const MAX_KM = adminRadiusKm;
      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords || {};
      if (typeof latitude === "number" && typeof longitude === "number") {
        const distanceKm = getDistanceKm(
          latitude,
          longitude,
          HOTEL_LAT,
          HOTEL_LNG
        );
        setLastDistanceKm(distanceKm);
        if (distanceKm <= MAX_KM) {
          await placeOrder(
            billingDetails.address,
            billingDetails.name,
            billingDetails.mobile,
            discountPercent
          );
          setBillingDetails({ name: "", mobile: "", address: "" });
          setOutOfRange(false);
          setLastDistanceKm(null);
          return;
        }
      }
      setOutOfRange(true);
    } catch (e) {
      showCustomAlert(
        "📍 Couldn't get current location. Please enable location and try again."
      );
    } finally {
      setIsFetchingLocation(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <FaShoppingCart className="text-8xl text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Add some delicious items to your cart to get started!
          </p>
          <a
            href="/menu"
            className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Browse Menu
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-10 sm:py-20 relative">
      {/* Custom Alert */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-red-500 text-black font-bold px-6 py-4 rounded-lg shadow-lg animate-fadeInOut">
          {alertMessage}
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-6 sm:mb-8 text-center">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-yellow-500">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4 sm:mb-6 flex items-center">
              <FaShoppingCart className="mr-2 sm:mr-3" />
              Cart Items ({cart.length})
            </h2>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex-1 w-full sm:w-auto mb-2 sm:mb-0">
                    <h3 className="text-base sm:text-lg font-semibold text-yellow-400">
                      {item.itemName}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      ₹{item.price} per item
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      >
                        <FaMinus className="text-sm" />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      >
                        <FaPlus className="text-sm" />
                      </button>
                    </div>

                    <div className="text-right">
                      {(() => {
                        const disc = getDiscountForCategory(item.category);
                        const unit = Number(item.price || 0);
                        const qty = Number(item.quantity || 0);
                        const base = unit * qty;
                        const unitAfter = disc.type === "flat"
                          ? Math.max(0, unit - Math.min(unit, Number(disc.value || 0)))
                          : Math.max(0, unit * (1 - (Number(disc.value) || 0) / 100));
                        const final = unitAfter * qty;
                        return unitAfter !== unit ? (
                          <div className="text-right">
                            <div className="text-gray-400 line-through">
                              ₹{base.toFixed(2)}
                            </div>
                            <div className="text-lg font-bold text-yellow-400">
                              ₹{final.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-yellow-400">
                            ₹{base.toFixed(2)}
                          </p>
                        );
                      })()}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors ml-0 sm:ml-3"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                <span>Total:</span>
                <span className="text-yellow-400">
                  ₹
                  {(() => {
                    const discounted = cart.reduce((sum, it) => {
                      const disc = getDiscountForCategory(it.category);
                      const p = Number(it.price || 0);
                      const q = Number(it.quantity || 0);
                      const unitAfter = disc.type === "flat"
                        ? Math.max(0, p - Math.min(p, Number(disc.value || 0)))
                        : Math.max(0, p * (1 - (Number(disc.value) || 0) / 100));
                      return sum + unitAfter * q;
                    }, 0);
                    return discounted.toFixed(2);
                  })()}
                </span>
              </div>
              {(() => {
                const hasAnyDiscount = cart.some((it) => {
                  const disc = getDiscountForCategory(it.category);
                  const p = Number(it.price || 0);
                  const unitAfter = disc.type === "flat"
                    ? Math.max(0, p - Math.min(p, Number(disc.value || 0)))
                    : Math.max(0, p * (1 - (Number(disc.value) || 0) / 100));
                  return unitAfter !== p;
                });
                return hasAnyDiscount;
              })() && (
                <div className="text-right text-xs sm:text-sm text-gray-400 mt-1">
                  <span className="line-through mr-2">
                    ₹
                    {getCartTotal().toFixed
                      ? getCartTotal().toFixed(2)
                      : getCartTotal()}
                  </span>
                  <span className="text-green-400">(Discount applied)</span>
                </div>
              )}
            </div>
          </div>

          {/* Billing Details */}
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-yellow-500">
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4 sm:mb-6">
              Billing Details
            </h2>

            {/* Auth Status */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border border-gray-700 bg-gray-800">
              {user ? (
                <div className="text-xs sm:text-sm text-gray-300">
                  Signed in as{" "}
                  <span className="text-yellow-400 font-semibold">
                    {user.displayName || user.email}
                  </span>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Sign in with Google
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-yellow-400 font-semibold mb-2 flex items-center text-sm">
                  <FaUser className="mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={billingDetails.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-yellow-400 font-semibold mb-2 flex items-center text-sm">
                  <FaMobileAlt className="mr-2" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={billingDetails.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>

              <div>
                <label className="block text-yellow-400 font-semibold mb-2 flex items-center text-sm">
                  <FaMapMarkerAlt className="mr-2" />
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  value={billingDetails.address}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white resize-none"
                  placeholder="Enter your complete delivery address"
                  required
                ></textarea>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 space-y-4">
              {outOfRange && (
                <div className="p-3 sm:p-4 rounded-lg border border-red-600 bg-red-900/40 text-red-200">
                  <div className="font-semibold mb-2">
                    Out of delivery range
                  </div>
                  <div className="text-xs sm:text-sm mb-3">
                    We currently deliver within 10 km only.
                    {typeof lastDistanceKm === "number" && (
                      <span>
                        {" "}
                        Your distance is ~{lastDistanceKm.toFixed(1)} km.
                      </span>
                    )}
                  </div>
                  <button
                    onClick={tryUseCurrentLocation}
                    disabled={isFetchingLocation}
                    className="bg-yellow-400 disabled:opacity-60 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 w-full"
                  >
                    {isFetchingLocation
                      ? "Checking..."
                      : "Use current location"}
                  </button>
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-lg font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-200"
              >
                {(() => {
                  const discounted = cart.reduce((sum, it) => {
                    const disc = getDiscountForCategory(it.category);
                    const p = Number(it.price || 0);
                    const q = Number(it.quantity || 0);
                    const unitAfter = disc.type === "flat"
                      ? Math.max(0, p - Math.min(p, Number(disc.value || 0)))
                      : Math.max(0, p * (1 - (Number(disc.value) || 0) / 100));
                    return sum + unitAfter * q;
                  }, 0);
                  return `Place Order - ₹${discounted.toFixed(2)}`;
                })()}
              </button>

              <button
                onClick={clearCart}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations for custom alert */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease forwards;
        }
      `}</style>
    </div>
  );
}
