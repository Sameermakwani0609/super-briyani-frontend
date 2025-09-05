"use client";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { FaMinus, FaPlus } from "react-icons/fa";

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

export default function FeaturedMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const { addToCart, cart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const q = query(
          collection(db, "menuItems"),
          where("category", "==", "Special")
        );
        const querySnapshot = await getDocs(q);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const snap = await getDocs(collection(db, "shop"));
        let discount = 0;
        snap.forEach((d) => {
          const data = d.data() || {};
          if (typeof data.DiscountPercent === "number") discount = data.DiscountPercent;
        });
        setDiscountPercent(discount);
      } catch {}
    };
    fetchDiscount();
  }, []);

  // Helper to get quantity in cart for an item
  const getCartQuantity = (itemId) => {
    const found = cart?.find((cartItem) => cartItem.id === itemId);
    return found ? found.quantity : 0;
  };

  // Reusable card component
  const Card = ({ item }) => {
    const quantity = getCartQuantity(item.id);
    const pct = Number(discountPercent) || 0;
    const price = Number(item.price || 0);
    const discounted = Math.max(0, price * (1 - pct / 100));
    const showDiscount = pct > 0 && discounted !== price;
    return (
      <div className="relative bg-black/70 backdrop-blur-md border border-gray-300 rounded-2xl p-6 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-yellow-300/50 group">
        {/* Image */}
        <div className="h-48 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.itemName}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-2xl font-playfair font-bold mb-2 text-yellow-400">
          {item.itemName}
        </h4>

        {/* Description */}
        <p className="text-gray-300 mb-4">{item.description}</p>

        {/* Price */}
        <div className="flex items-center">
          {showDiscount ? (
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-400">₹{price.toFixed(2)}</span>
              <span className="text-2xl font-bold text-yellow-400">₹{discounted.toFixed(2)}</span>
              <span className="text-xs text-green-400">({pct}% off)</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-yellow-400">₹{price.toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart or Quantity Controls */}
        {quantity === 0 ? (
          <button
            onClick={() => addToCart(item)}
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

        {/* Glow effect */}
       <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-15 bg-yellow-400 blur-xl transition-all pointer-events-none"></div>

      </div>
    );
  };

  return (
    <section id="menu" className="py-20 bg-black">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16 opacity-0 animate-fadeIn">
          <h3 className="text-5xl font-playfair font-bold text-yellow-400 mb-4">
            Signature Menu
          </h3>
          <p className="text-xl text-gray-300">
            Discover our most celebrated dishes
          </p>
        </div>

        {/* Show Carousel if >3 else Grid */}
        {menuItems.length > 3 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={3}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{ delay: 3000 }}
            className="pb-10"
          >
            {menuItems.map((item) => (
              <SwiperSlide key={item.id}>
                <Card item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
