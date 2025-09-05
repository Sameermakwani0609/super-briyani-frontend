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
  const [adminCenter, setAdminCenter] = useState({ lat: 20.491026, lng: 77.866386 });
  const [adminRadiusKm, setAdminRadiusKm] = useState(10);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const snapshot = await getDocs(collection(db, "shop"));
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() || {};
          if (typeof data.CityLat === "number" && typeof data.CityLng === "number") {
            setAdminCenter({ lat: data.CityLat, lng: data.CityLng });
          }
          if (typeof data.DeliveryRadiusKm === "number") {
            setAdminRadiusKm(data.DeliveryRadiusKm);
          }
          if (typeof data.DiscountPercent === "number") {
            setDiscountPercent(data.DiscountPercent);
          }
        }
      } catch {
        // ignore and keep defaults
      }
    })();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
      alert("Please fill in all billing details");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!user) {
      alert("Please sign in with Google first");
      return;
    }

    try {
      // Gate by location using admin-defined center & radius
      const HOTEL_LAT = adminCenter.lat;
      const HOTEL_LNG = adminCenter.lng;
      const MAX_KM = adminRadiusKm;

      try {
        const pos = await getCurrentPosition();
        const { latitude, longitude } = pos.coords || {};
        if (typeof latitude === "number" && typeof longitude === "number") {
          const distanceKm = getDistanceKm(latitude, longitude, HOTEL_LAT, HOTEL_LNG);
          if (distanceKm > MAX_KM) {
            setOutOfRange(true);
            setLastDistanceKm(distanceKm);
            return;
          }
        }
      } catch (geoErr) {
        // If user blocks or geolocation fails, block order to avoid out-of-area deliveries
        alert("We couldn't verify your location. Please enable location access to place an order within 10 km of Ner, Yavatmal (Maharashtra).");
        return;
      }

      await placeOrder(billingDetails.address, billingDetails.name, billingDetails.mobile);
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
        const distanceKm = getDistanceKm(latitude, longitude, HOTEL_LAT, HOTEL_LNG);
        setLastDistanceKm(distanceKm);
        if (distanceKm <= MAX_KM) {
          await placeOrder(billingDetails.address);
          setBillingDetails({ name: "", mobile: "", address: "" });
          setOutOfRange(false);
          setLastDistanceKm(null);
          return;
        }
      }
      setOutOfRange(true);
    } catch (e) {
      alert("Couldn't get current location. Please enable location and try again.");
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
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
          Your Cart
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
              <FaShoppingCart className="mr-3" />
              Cart Items ({cart.length})
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-400">
                      {item.itemName}
                    </h3>
                    <p className="text-gray-400">₹{item.price} per item</p>
                  </div>

                  <div className="flex items-center space-x-3">
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
                      <p className="text-lg font-bold text-yellow-400">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors ml-3"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-yellow-400">₹{(() => {
                  const raw = getCartTotal();
                  const pct = Number(discountPercent) || 0;
                  const discounted = Math.max(0, raw * (1 - pct / 100));
                  return discounted.toFixed(2);
                })()}</span>
              </div>
              {Number(discountPercent) > 0 && (
                <div className="text-right text-sm text-gray-400 mt-1">
                  <span className="line-through mr-2">₹{getCartTotal().toFixed ? getCartTotal().toFixed(2) : getCartTotal()}</span>
                  <span className="text-green-400">({Number(discountPercent)}% off applied)</span>
                </div>
              )}
            </div>
          </div>

          {/* Billing Details */}
          <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">
              Billing Details
            </h2>

            {/* Auth Status */}
            <div className="mb-6 p-4 rounded-lg border border-gray-700 bg-gray-800">
              {user ? (
                <div className="text-sm text-gray-300">
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
                <label className="block text-yellow-400 font-semibold mb-2 flex items-center">
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
                <label className="block text-yellow-400 font-semibold mb-2 flex items-center">
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
                <label className="block text-yellow-400 font-semibold mb-2 flex items-center">
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

            <div className="mt-8 space-y-4">
              {outOfRange && (
                <div className="p-4 rounded-lg border border-red-600 bg-red-900/40 text-red-200">
                  <div className="font-semibold mb-2">Out of delivery range</div>
                  <div className="text-sm mb-3">
                    We currently deliver within 10 km only.
                    {typeof lastDistanceKm === "number" && (
                      <span> Your distance is ~{lastDistanceKm.toFixed(1)} km.</span>
                    )}
                  </div>
                  <button
                    onClick={tryUseCurrentLocation}
                    disabled={isFetchingLocation}
                    className="bg-yellow-400 disabled:opacity-60 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500"
                  >
                    {isFetchingLocation ? "Checking..." : "Use current location"}
                  </button>
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-200"
              >
                {(() => {
                  const raw = Number(getCartTotal() || 0);
                  const pct = Number(discountPercent) || 0;
                  const discounted = Math.max(0, raw * (1 - pct / 100));
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
    </div>
  );
}
