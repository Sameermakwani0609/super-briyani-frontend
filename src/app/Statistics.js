"use client";
import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Happy Customers", value: 15000 },
  { label: "Weddings Catered", value: 500 },
  { label: "Years Experience", value: 25 },
  { label: "Signature Dishes", value: 50 },
];

export default function Statistics() {
  const [counters, setCounters] = useState(stats.map(stat => stat.value));
  const [isClient, setIsClient] = useState(false);
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Reset counters to 0 for animation
    setCounters(stats.map(() => 0));
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          stats.forEach((stat, index) => {
            let start = 0;
            const duration = 2000; // animation duration in ms
            const step = (timestampStart) => {
              const now = performance.now();
              const progress = Math.min((now - timestampStart) / duration, 1);
              const value = Math.floor(progress * stat.value);
              setCounters((prev) => {
                const newCounters = [...prev];
                newCounters[index] = value;
                return newCounters;
              });
              if (progress < 1) {
                requestAnimationFrame(() => step(timestampStart));
              }
            };
            requestAnimationFrame((timestamp) => step(timestamp));
          });
          setHasAnimated(true); // prevent re-trigger
        }
      },
      { threshold: 0.5 } // 50% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      const currentRef = sectionRef.current;
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasAnimated, isClient]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-r from-gray-900 to-black"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center opacity-0 animate-fadeIn"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationFillMode: "forwards",
              }}
            >
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {counters[index]}
              </div>
              <p className="text-gray-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
