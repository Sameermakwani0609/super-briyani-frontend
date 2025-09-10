"use client";

import { useState, useEffect } from "react";
import { GiChickenOven, GiCupcake, GiKnifeFork } from "react-icons/gi";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useCart } from "./CartContext";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";


export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(null); // Track shop open status
  const [discountPercent, setDiscountPercent] = useState(0);
  const { addToCart, cart, updateQuantity } = useCart(); // <-- add cart, updateQuantity

  // Map category names to icons
  const categoryIcons = {
    "main course": GiChickenOven,
    starters: GiKnifeFork,
    desserts: GiCupcake,
    all: GiKnifeFork,
  };

  // Fetch shop status and menu items
  useEffect(() => {
    const fetchShopStatusAndMenu = async () => {
      // Fetch shop status from collection
      try {
        const shopSnapshot = await getDocs(collection(db, "shop"));
        let openStatus = false;
        let discount = 0;
        shopSnapshot.forEach((doc) => {
          const data = doc.data() || {};
          if (data.IsOpen !== undefined) openStatus = data.IsOpen;
          if (typeof data.DiscountPercent === "number") discount = data.DiscountPercent;
        });
        setIsOpen(openStatus);
        setDiscountPercent(discount);
      } catch {
        setIsOpen(false);
      }

      // try cache first
      try {
        const cached = sessionStorage.getItem("menuItemsCache");
        if (cached) {
          const items = JSON.parse(cached);
          setMenuItems(items);
          const uniqueCategories = [
            "all",
            ...new Set(items.map((item) => item.category.toLowerCase())),
          ];
          setCategories(uniqueCategories);
        }
      } catch {}

      const querySnapshot = await getDocs(collection(db, "menuItems"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
      try {
        sessionStorage.setItem("menuItemsCache", JSON.stringify(items));
      } catch {}

      // Extract unique categories from items
      const uniqueCategories = [
        "all",
        ...new Set(items.map((item) => item.category.toLowerCase())),
      ];
      setCategories(uniqueCategories);
    };

    fetchShopStatusAndMenu();
  }, []);

  const filteredItems =
    filter === "all"
      ? menuItems
      : menuItems.filter(
          (item) => item.category.toLowerCase() === filter.toLowerCase()
        );

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  // Helper to get quantity in cart for an item
  const getCartQuantity = (itemId) => {
    const found = cart?.find((cartItem) => cartItem.id === itemId);
    return found ? found.quantity : 0;
  };

  // If isOpen is null, show nothing (loading)
  if (isOpen === null) {
    return (
      <section className="pt-24 pb-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-12">
            Loading...
          </h2>
        </div>
      </section>
    );
  }

  // If shop is closed
  if (!isOpen) {
    return (
      <section className="pt-24 pb-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-yellow-400 mb-12 drop-shadow-lg">
            Sorry, we are not available to serve right now.
          </h2>
          <p className="text-xl text-yellow-300">Please check back later!</p>
        </div>
      </section>
    );
  }

  // If shop is open, show menu
  return (
    <section className="pt-20 pb-10 bg-black text-white min-h-screen">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl font-bold text-center text-yellow-400 mb-8 sm:mb-12 drop-shadow-lg">
          Our Menu
        </h2>

        {/* Menu Categories */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex space-x-2 sm:space-x-4 bg-yellow-400/20 p-2 rounded-lg overflow-x-auto scrollbar-hide">
            {categories.map((key) => {
              const Icon = categoryIcons[key] || GiKnifeFork;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    filter === key
                      ? "bg-yellow-400 text-black"
                      : "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  }`}
                >
                  <Icon />
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const quantity = getCartQuantity(item.id);
            const pct = Number(discountPercent) || 0;
            const price = Number(item.price || 0);
            const discounted = Math.max(0, price * (1 - pct / 100));
            const showDiscount = pct > 0 && discounted !== price;
            return (
              <div
                key={item.id}
                className="bg-yellow-400/10 border border-yellow-400 rounded-xl p-6 text-center hover:scale-105 hover:bg-yellow-400/20 transition-all"
              >
                {/* Image */}
                <div className="mb-4 h-40 w-full overflow-hidden rounded-lg flex items-center justify-center">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.itemName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                  {item.itemName}
                </h3>
                <div className="text-xl mb-4">
                  {showDiscount ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="line-through text-gray-400">₹{price.toFixed(2)}</span>
                      <span className="text-yellow-400 font-bold">₹{discounted.toFixed(2)}</span>
                      <span className="text-xs text-green-400">({pct}% off)</span>
                    </div>
                  ) : (
                    <span>₹{price.toFixed(2)}</span>
                  )}
                </div>
                {/* Add to Cart or Quantity Controls */}
                {quantity === 0 ? (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      className="bg-yellow-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-yellow-500 transition-colors"
                    >
                      <FaMinus />
                    </button>
                    <span className="text-lg font-bold text-yellow-400 w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      className="bg-yellow-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-yellow-500 transition-colors"
                    >
                      <FaPlus />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
