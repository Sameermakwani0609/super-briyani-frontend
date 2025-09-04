"use client";

import { useState, useEffect } from "react";

const testimonialsData = [
  {
    quote: "The best briyani I've ever had! The flavors are absolutely incredible and the service is exceptional. Perfect for our wedding celebration.",
    name: "Priya & Raj Sharma",
    type: "Wedding Catering",
  },
  {
    quote: "Outstanding party catering service! Every dish was perfectly prepared and our guests couldn't stop praising the food quality.",
    name: "Ahmed Khan",
    type: "Corporate Event",
  },
  {
    quote: "Amazing online ordering experience! Food arrived hot and fresh within 25 minutes. The packaging was premium quality too.",
    name: "Sneha Patel",
    type: "Regular Customer",
  },
];

export default function Testimonial() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonialsData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-5xl playfair font-bold text-yellow-400 mb-4">
            What Our Customers Say
          </h3>
          <p className="text-xl text-gray-500">
            Authentic reviews from our valued customers
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl p-8 border-2 border-yellow-300">
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className={`text-center transition-opacity duration-500 ${
                  index === currentSlide
                    ? "opacity-100 relative"
                    : "opacity-0 absolute inset-0"
                }`}
              >
                <div className="text-6xl text-yellow-400 mb-4">"</div>

                <p className="text-xl text-white mb-6 italic">
                  {testimonial.quote}
                </p>

                <div className="flex items-center justify-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400"></i>
                  ))}
                </div>

                <h4 className="text-lg font-bold text-yellow-400">{testimonial.name}</h4>
                <p className="text-gray-500">{testimonial.type}</p>
              </div>
            ))}

            <div className="flex justify-center mt-8 space-x-2">
              {testimonialsData.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentSlide ? "bg-yellow-400" : "bg-gray-400"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
