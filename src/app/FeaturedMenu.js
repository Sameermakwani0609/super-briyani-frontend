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
      <div className="relative bg-black/70 backdrop-blur-md border border-gray-300 rounded-2xl p-6 flex flex-col justify-between items-center w-full h-80 max-w-xs mx-auto
        transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-yellow-300/50 group">
        {/* Image */}
        <div className="h-32 w-full rounded-xl mb-4 flex items-center justify-center overflow-hidden">
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
        <h4 className="text-lg font-playfair font-bold mb-1 text-yellow-400 text-center">
          {item.itemName}
        </h4>
        {/* Description */}
        <p className="text-gray-300 mb-2 text-sm text-center">{item.description}</p>
        {/* Price */}
        <div className="flex items-center justify-center mb-2">
          {showDiscount ? (
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-400">₹{price.toFixed(2)}</span>
              <span className="text-lg font-bold text-yellow-400">₹{discounted.toFixed(2)}</span>
              <span className="text-xs text-green-400">({pct}% off)</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-yellow-400">₹{price.toFixed(2)}</span>
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
      <div className="container mx-auto px-2 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-10 opacity-0 animate-fadeIn">
          <h3 className="text-3xl sm:text-5xl font-playfair font-bold text-yellow-400 mb-2 sm:mb-4">
            Signature Menu
          </h3>
          <p className="text-base sm:text-xl text-gray-300">
            Discover our most celebrated dishes
          </p>
        </div>
        {/* Show Carousel if >3 else Grid */}
        {menuItems.length > 3 ? (
          <Swiper
            modules={[Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
      {/* Swiper theme overrides */}
      <style jsx global>{`
        /* Remove navigation arrow styles */
        .swiper-pagination-bullet {
          background: #facc15 !important; /* Tailwind yellow-400 */
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #f59e0b !important; /* Tailwind yellow-500 */
        }
      `}</style>
    </section>
  );
}
