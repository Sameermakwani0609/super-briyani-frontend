"use client";

export default function WeddingCatering() {
  return (
    <section
      id="wedding"
      className="py-20 bg-gradient-to-b from-gray-900 to-black"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 fade-in">
          <h3 className="text-5xl playfair font-bold text-yellow-400 mb-4">
            Wedding Catering
          </h3>
          <p className="text-xl text-gray-300">
            Royal treatment for your special day
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h4 className="text-3xl playfair font-bold text-yellow-400 mb-6">
                Premium Wedding Packages
              </h4>

              <div className="space-y-6">
                <div className="dark-glass rounded-xl p-6 border border-yellow-400/20 hover:border-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg">
                  <h5 className="text-xl font-bold text-yellow-400 mb-2">
                    Royal Package
                  </h5>
                  <p className="text-gray-300 mb-3">
                    Complete wedding feast for 200+ guests
                  </p>
                  <p className="text-2xl text-yellow-400 font-bold">
                    Starting ₹850/person
                  </p>
                </div>
                <div className="dark-glass rounded-xl p-6 border border-yellow-400/20 hover:border-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg">
                  <h5 className="text-xl font-bold text-yellow-400 mb-2">
                    Premium Package
                  </h5>
                  <p className="text-gray-300 mb-3">
                    Elegant catering for 100+ guests
                  </p>
                  <p className="text-2xl text-yellow-400 font-bold">
                    Starting ₹650/person
                  </p>
                </div>
                <div className="dark-glass rounded-xl p-6 border border-yellow-400/20 hover:border-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg">
                  <h5 className="text-xl font-bold text-yellow-400 mb-2">
                    Classic Package
                  </h5>
                  <p className="text-gray-300 mb-3">
                    Traditional spread for intimate ceremonies
                  </p>
                  <p className="text-2xl text-yellow-400 font-bold">
                    Starting ₹450/person
                  </p>
                </div>
              </div>
            </div>
            <div className="fade-in">
              <div className="dark-glass rounded-2xl p-8">
                <h4 className="text-2xl playfair font-bold text-yellow-400 mb-6">
                  Wedding Inquiry
                </h4>

                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Bride's Name"
                      className="bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Groom's Name"
                      className="bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <input
                    type="date"
                    className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Number of Guests"
                    className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
                  />
                  <textarea
                    placeholder="Venue Details"
                    rows="3"
                    className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
                  ></textarea>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 rounded-lg font-semibold flex justify-center items-center"
                  >
                    <i className="fas fa-heart mr-2"></i>
                    Request Quote
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
