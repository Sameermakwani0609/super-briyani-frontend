// app/components/PartyCatering.js
"use client";
import { FaBirthdayCake, FaBriefcase, FaHome } from "react-icons/fa";

const PartyCatering = () => {
  return (
    <section id="party" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 fade-in">
          <h3 className="text-5xl playfair font-bold text-yellow-400 mb-4">
            Party Catering
          </h3>
          <p className="text-xl text-gray-300">
            Make your celebrations memorable with our premium catering
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Birthday Parties */}
          <div className="dark-glass rounded-2xl p-6 border border-yellow-400/40 hover:border-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg fade-in">
            <div className="text-center mb-6 flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center bg-yellow-400 rounded-full shadow-lg mb-4">
                <FaBirthdayCake className="text-3xl text-black" />
              </div>
              <h4 className="text-2xl playfair font-bold text-yellow-400">
                Birthday Party
              </h4>
            </div>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li>• Customized menu for all ages</li>
              <li>• Special birthday briyani</li>
              <li>• Decoration assistance</li>
              <li>• Professional service staff</li>
            </ul>
          </div>
          <div className="dark-glass rounded-2xl p-6 border border-yellow-400/40 hover:border-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg fade-in">
            <div className="text-center mb-6 flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center bg-yellow-400 rounded-full shadow-lg mb-4">
                <FaBriefcase className="text-3xl text-black" />
              </div>
              <h4 className="text-2xl playfair font-bold text-yellow-400">
                Corporate Events
              </h4>
            </div>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li>• Professional presentation</li>
              <li>• Buffet & plated options</li>
              <li>• Punctual delivery</li>
              <li>• Custom packaging</li>
            </ul>
          </div>
          <div className="dark-glass rounded-2xl p-6 border border-yellow-400/40 hover:border-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg fade-in">
            <div className="text-center mb-6 flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center bg-yellow-400 rounded-full shadow-lg mb-4">
                <FaHome className="text-3xl text-black" />
              </div>
              <h4 className="text-2xl playfair font-bold text-yellow-400">
                Home Gathering
              </h4>
            </div>
            <ul className="space-y-2 text-gray-300 mb-6">
              <li>• Intimate family portions</li>
              <li>• Home delivery setup</li>
              <li>• Flexible timing</li>
              <li>• Fresh preparation</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartyCatering;
