// About.js
"use client";

export default function About() {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <h3 className="text-5xl playfair font-bold text-yellow-400 mb-8">
            Our Royal Legacy
          </h3>

          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            For over 25 years, Super Briyani has been serving the most authentic and flavorful briyani in the region. 
            Our recipes have been passed down through generations, combining traditional cooking methods with the finest ingredients 
            to create an unforgettable dining experience.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="rounded-xl p-6 border-2 border-yellow-300 hover:shadow-lg transition-all duration-300 text-center">
              <i className="fas fa-award text-4xl text-yellow-400 mb-4"></i>
              <h4 className="text-xl font-bold text-yellow-400 mb-2">Award Winning</h4>
              <p className="text-gray-300">Recognized for excellence in traditional cuisine</p>
            </div>

            <div className="rounded-xl p-6 border-2 border-yellow-300 hover:shadow-lg transition-all duration-300 text-center">
              <i className="fas fa-leaf text-4xl text-yellow-400 mb-4"></i>
              <h4 className="text-xl font-bold text-yellow-400 mb-2">Fresh Ingredients</h4>
              <p className="text-gray-300">Sourced daily from trusted local suppliers</p>
            </div>

            <div className="rounded-xl p-6 border-2 border-yellow-300 hover:shadow-lg transition-all duration-300 text-center">
              <i className="fas fa-heart text-4xl text-yellow-400 mb-4"></i>
              <h4 className="text-xl font-bold text-yellow-400 mb-2">Made with Love</h4>
              <p className="text-gray-300">Every dish prepared with passion and care</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
