"use client";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-yellow-400/20 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <i className="fas fa-crown text-black text-xl"></i>
            </div>
            <h1 className="text-2xl playfair font-bold text-yellow-400">
              Super Briyani
            </h1>
          </div>
          <p className="text-gray-400 mb-6">
            Experience the royal taste of authentic briyani
          </p>
          <p className="text-gray-500">© 2025 Super Briyani. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
