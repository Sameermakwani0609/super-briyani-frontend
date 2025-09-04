"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaUser,
  FaPhone,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
      await placeOrder(billingDetails.address);
      setBillingDetails({ name: "", mobile: "", address: "" });
    } catch (e) {
      // placeOrder already alerts on failure
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
                <span className="text-yellow-400">₹{getCartTotal()}</span>
              </div>
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
                  <FaPhone className="mr-2" />
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
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-200"
              >
                Place Order - ₹{getCartTotal()}
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
