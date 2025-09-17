"use client";

import { useState, useEffect } from "react";
import { GiChickenOven, GiCupcake, GiKnifeFork } from "react-icons/gi";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useCart } from "./CartContext";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFlat, setDiscountFlat] = useState(0);
  const [categoryDiscounts, setCategoryDiscounts] = useState({});
  const { addToCart, cart, updateQuantity } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(9);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categoryIcons = {
    "main course": GiChickenOven,
    starters: GiKnifeFork,
    desserts: GiCupcake,
    all: GiKnifeFork,
  };

  useEffect(() => {
    const fetchShopStatusAndMenu = async () => {
      try {
        const shopSnapshot = await getDocs(collection(db, "shop"));
        let openStatus = false;
        let discount = 0;
        let flat = 0;
        shopSnapshot.forEach((doc) => {
          const data = doc.data() || {};
          if (data.IsOpen !== undefined) openStatus = data.IsOpen;
          if (typeof data.DiscountPercent === "number") discount = data.DiscountPercent;
          if (typeof data.DiscountFlat === "number") flat = data.DiscountFlat;
          if (data.CategoryDiscounts && typeof data.CategoryDiscounts === "object") {
            setCategoryDiscounts(data.CategoryDiscounts || {});
          }
        });
        setIsOpen(openStatus);
        setDiscountPercent(discount);
        setDiscountFlat(flat);
      } catch {
        setIsOpen(false);
      }

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

      const uniqueCategories = [
        "all",
        ...new Set(items.map((item) => item.category.toLowerCase())),
      ];
      setCategories(uniqueCategories);
    };

    fetchShopStatusAndMenu();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      filter === "all" || item.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = item.itemName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const paginatedItems = filteredItems.slice(0, currentPage * itemsPerPage);
  const hasMore = paginatedItems.length < filteredItems.length;

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const getDiscountForCategory = (category, price) => {
    const fallbackFlat = Number(discountFlat) || 0;
    const fallback = { type: "flat", value: Math.max(0, fallbackFlat) };
    if (!category) return fallback;
    const key = String(category).toLowerCase();
    for (const [catKey, val] of Object.entries(categoryDiscounts || {})) {
      if (String(catKey).toLowerCase() === key) {
        if (val && typeof val === "object") {
          if (val.type === "flat") {
            const amt = Math.max(0, Number(val.value) || 0);
            // effectivePercent is only for display use if ever needed
            const pct = price > 0 ? Math.min(100, (amt / price) * 100) : 0;
            return { type: "flat", value: amt, effectivePercent: pct };
          }
          const pct = Math.max(0, Math.min(100, Number(val.value) || 0));
          return { type: "percent", value: pct };
        }
        const n = Number(val);
        if (Number.isFinite(n)) return { type: "percent", value: Math.max(0, Math.min(100, n)) };
      }
    }
    return fallback;
  };

  const getCartQuantity = (itemId) => {
    const found = cart?.find((cartItem) => cartItem.id === itemId);
    return found ? found.quantity : 0;
  };

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

  return (
    <section className="pt-20 pb-10 bg-black text-white min-h-screen">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl font-bold text-center text-yellow-400 mb-2 sm:mb-4 drop-shadow-lg">
          Our Menu
        </h2>

        {/* ✅ Notice Section */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-6 sm:mb-8">
          <span className="bg-red-600 text-white text-sm sm:text-base px-4 py-2 rounded-full shadow-md font-semibold animate-pulse">
            ❌ Not on Zomato & Swiggy
          </span>
          <span className="bg-green-600 text-white text-sm sm:text-base px-4 py-2 rounded-full shadow-md font-semibold">
            🥩 No Beef Served
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6 sm:mb-8 px-4">
          <input
            type="text"
            placeholder="🔍 Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-md px-5 py-3 rounded-xl border border-yellow-400 
                       bg-black text-white placeholder-yellow-400 
                       focus:outline-none focus:ring-2 focus:ring-yellow-400 
                       focus:shadow-lg text-base sm:text-lg transition-all"
          />
        </div>

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
          {paginatedItems.map((item) => {
            const quantity = getCartQuantity(item.id);
            const price = Number(item.price || 0);
            const disc = getDiscountForCategory(item.category, price);
            const discounted = disc.type === "flat"
              ? Math.max(0, price - Math.min(price, Number(disc.value || 0)))
              : Math.max(0, price * (1 - (Number(disc.value) || 0) / 100));
            const showDiscount = discounted !== price;
            return (
              <div
                key={item.id}
                className="bg-yellow-400/10 border border-yellow-400 rounded-xl p-6 text-center hover:scale-105 hover:bg-yellow-400/20 transition-all"
              >
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
                      <span className="line-through text-gray-400">
                        ₹{price.toFixed(2)}
                      </span>
                      <span className="text-yellow-400 font-bold">
                        ₹{discounted.toFixed(2)}
                      </span>
                      <span className="text-xs text-green-400">
                        {disc.type === "flat"
                          ? `(₹${Math.min(price, Number(disc.value || 0))} off)`
                          : `(${Number(disc.value)}% off)`}
                      </span>
                    </div>
                  ) : (
                    <span>₹{price.toFixed(2)}</span>
                  )}
                </div>
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

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors shadow-lg"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
