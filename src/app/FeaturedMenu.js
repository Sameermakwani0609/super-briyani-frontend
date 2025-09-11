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
          if (typeof data.DiscountPercent === "number")
            discount = data.DiscountPercent;
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
      <div className="relative bg-gradient-to-b from-black/70 to-black backdrop-blur-md border border-gray-800 rounded-2xl p-5 md:p-6 xl:p-7 flex flex-col justify-between items-center w-full h-auto min-h-[22rem] md:min-h-[24rem] transition-all duration-300 shadow-lg shadow-black/40 ring-1 ring-yellow-400/10">
        {showDiscount && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow-md">
            Save {pct}%
          </div>
        )}
        {/* Image */}
        <div className="h-36 md:h-40 xl:h-44 w-full rounded-xl mb-5 flex items-center justify-center overflow-hidden bg-black/40 border border-gray-800 p-2">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.itemName}
              className="w-full h-full object-contain transition-transform duration-500"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
        {/* Title */}
        <h4 className="text-xl md:text-2xl font-playfair font-bold mb-1 text-yellow-400 text-center">
          {item.itemName}
        </h4>
        {/* Description */}
        <p className="text-gray-300 mb-3 text-sm md:text-base text-center">
          {item.description}
        </p>
        {/* Price */}
        <div className="flex items-center justify-center mb-3">
          {showDiscount ? (
            <div className="flex items-center gap-2">
              <span className="line-through text-gray-400">
                ₹{price.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-yellow-400">
                ₹{discounted.toFixed(2)}
              </span>
              <span className="text-xs text-green-400">({pct}% off)</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-yellow-400">
              ₹{price.toFixed(2)}
            </span>
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
              className="bg-yellow-400 text-black w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold hover:bg-yellow-500 transition-colors"
            >
              <FaMinus />
            </button>
            <span className="text-lg font-bold text-yellow-400 w-8 md:w-9 text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="bg-yellow-400 text-black w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold hover:bg-yellow-500 transition-colors"
            >
              <FaPlus />
            </button>
          </div>
        )}
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
        {/* Show Swiper on mobile/tablet; horizontal scroll on desktop when >4 */}
        <div className="block lg:hidden">
          {menuItems.length > 3 ? (
            <Swiper
              modules={[Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
              {menuItems.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          {menuItems.length > 4 ? (
            <div className="menu-scroll overflow-x-auto pb-4">
              <div className="flex items-stretch gap-8 pr-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="shrink-0 w-[22rem]">
                    <Card item={item} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-8 xl:gap-10">
              {menuItems.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
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

        /* Desktop horizontal scroll styling */
        .menu-scroll {
          scrollbar-width: thin;
          scrollbar-color: #facc15 transparent;
        }
        .menu-scroll::-webkit-scrollbar {
          height: 10px;
        }
        .menu-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .menu-scroll::-webkit-scrollbar-thumb {
          background-color: #facc15;
          border-radius: 9999px;
        }
      `}</style>
    </section>
  );
}
