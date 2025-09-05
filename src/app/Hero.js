import { FaUtensils, FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-[length:400%_400%] animate-videoSimulation bg-cover bg-center"
      style={{ backgroundImage: "url('/briyani.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h2 className="text-6xl md:text-8xl font-playfair font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 fade-in">
          Asif Bhai&apos;s Biryani
        </h2>

        <p
          className="text-xl md:text-2xl mb-8 text-gray-300 fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Experience the finest authentic flavors crafted with royal tradition
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <Link href="/menu">
            <button className="flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-yellow-400/25 transition-all transform hover:-translate-y-2">
              <FaUtensils className="mr-2" />
              Order Now
            </button>
          </Link>

          <Link href="#contact">
            <button className="flex items-center justify-center border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-yellow-400 hover:text-black transition-all transform hover:-translate-y-2">
              <FaCalendarAlt className="mr-2" />
              Book Event
            </button>
          </Link>
        </div>
      </div>

      {/* Scroll down indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-yellow-400 text-2xl">
        <FaChevronDown />
      </div>
    </section>
  );
}
