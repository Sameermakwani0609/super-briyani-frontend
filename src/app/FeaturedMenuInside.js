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
import { Pagination, Autoplay } from "swiper/modules";

export default function FeaturedMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [categoryDiscounts, setCategoryDiscounts] = useState({});
  const { cart } = useCart();

  // ✅ track if user is on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // mobile breakpoint (< md)
    };
    handleResize(); // run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          if (
            data.CategoryDiscounts &&
            typeof data.CategoryDiscounts === "object"
          ) {
            setCategoryDiscounts(data.CategoryDiscounts || {});
          }
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
    const resolveDiscount = () => {
      const cat = item?.category;
      const global = {
        type: "percent",
        value: Math.max(0, Math.min(100, Number(discountPercent) || 0)),
      };
      if (!cat) return global;
      const key = String(cat).toLowerCase();
      for (const [k, v] of Object.entries(categoryDiscounts || {})) {
        if (String(k).toLowerCase() === key) {
          if (v && typeof v === "object") {
            if (v.type === "flat") return { type: "percent", value: 0 };
            return {
              type: "percent",
              value: Math.max(0, Math.min(100, Number(v.value) || 0)),
            };
          }
          const n = Number(v);
          if (Number.isFinite(n))
            return { type: "percent", value: Math.max(0, Math.min(100, n)) };
        }
      }
      return global;
    };
    const disc = resolveDiscount();
    const price = Number(item.price || 0);
    const discounted = Math.max(
      0,
      price * (1 - (Number(disc.value) || 0) / 100)
    );
    const showDiscount = discounted !== price;
    return (
      <div className="relative backdrop-blur-md border border-gray-800 rounded-2xl p-2 md:p-6 xl:p-7 flex flex-col justify-between items-center w-full h-auto min-h-[13rem] md:min-h-[13rem] transition-all duration-300 shadow-lg shadow-black/40 ring-1 ring-yellow-400/10">
        {showDiscount && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow-md">
            🔥 Hot Picks
          </div>
        )}
        {/* Image */}
        <div className="h-36 md:h-40 xl:h-100 w-full flex items-center justify-center overflow-hidden bg-black/40 p-2">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.itemName}
              className="w-full rounded-xl object-cover h-full object-contain transition-transform duration-500"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
        {/* Title */}
        <h4 className="text-xl md:text-2xl font-playfair italic mb-4 text-yellow-400 text-center">
          {item.itemName}
        </h4>
      </div>
    );
  };

  return (
    <section id="menu" className="py-5 bg-black">
      <div className="container mx-auto px-2 sm:px-6">
        {menuItems.length > 0 && (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 }, // sm
              768: { slidesPerView: 1 }, // md
              1024: { slidesPerView: 1 }, // lg
              1280: { slidesPerView: 1 }, // xl
            }}
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="pb-10"
          >
            {menuItems.map((item) => (
              <SwiperSlide key={item.id}>
                <Card item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Swiper theme overrides */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #facc15 !important;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #f59e0b !important;
        }
      `}</style>
    </section>
  );
}
