"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaHeart, FaSpinner } from "react-icons/fa";

export default function WeddingCatering() {
  const [formData, setFormData] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    numberOfGuests: "",
    venueDetails: "",
    contactNumber: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const inquiryData = {
        type: "wedding",
        brideName: formData.brideName,
        groomName: formData.groomName,
        weddingDate: formData.weddingDate,
        numberOfGuests: parseInt(formData.numberOfGuests) || 0,
        venueDetails: formData.venueDetails,
        contactNumber: formData.contactNumber,
        email: formData.email,
        createdAt: serverTimestamp(),
        status: "new"
      };

      await addDoc(collection(db, "inquiries"), inquiryData);
      
      setSubmitMessage("Wedding inquiry submitted successfully! We'll contact you soon.");
      setFormData({
        brideName: "",
        groomName: "",
        weddingDate: "",
        numberOfGuests: "",
        venueDetails: "",
        contactNumber: "",
        email: ""
      });
    } catch (error) {
      console.error("Error submitting wedding inquiry:", error);
      setSubmitMessage("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="brideName"
                      value={formData.brideName}
                      onChange={handleInputChange}
                      placeholder="Bride's Name"
                      className="bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
                      required
                    />
                    <input
                      type="text"
                      name="groomName"
                      value={formData.groomName}
                      onChange={handleInputChange}
                      placeholder="Groom's Name"
                      className="bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
                      required
                    />
                  </div>

                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
                    required
                  />
                  <input
                    type="number"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleInputChange}
                    placeholder="Number of Guests"
                    className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
                    min="1"
                    required
                  />
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="Contact Number"
                    className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
                    required
                  />
                  <textarea
                    name="venueDetails"
                    value={formData.venueDetails}
                    onChange={handleInputChange}
                    placeholder="Venue Details"
                    rows="3"
                    className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none text-white"
                    required
                  ></textarea>

                  {submitMessage && (
                    <div className={`p-3 rounded-lg text-center ${
                      submitMessage.includes("successfully") 
                        ? "bg-green-600 text-white" 
                        : "bg-red-600 text-white"
                    }`}>
                      {submitMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 rounded-lg font-semibold flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <FaSpinner className="mr-2 animate-spin" />
                    ) : (
                      <FaHeart className="mr-2" />
                    )}
                    {isSubmitting ? "Submitting..." : "Request Quote"}
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
