"use client";

import { useState, useEffect } from "react";
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (submitMessage && submitMessage.includes("successfully")) {
      const t = setTimeout(() => {
        setSubmitMessage("");
      }, 12000); // auto-hide after ~12s
      return () => clearTimeout(t);
    }
  }, [submitMessage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    if (!validate()) {
      setIsSubmitting(false);
      setSubmitMessage("Please correct the highlighted fields.");
      return;
    }
    setIsSubmitting(true);

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

  const validate = () => {
    const errs = {};
    if (!formData.brideName?.trim()) errs.brideName = "Bride's name is required";
    if (!formData.groomName?.trim()) errs.groomName = "Groom's name is required";
    if (!formData.weddingDate?.trim()) errs.weddingDate = "Wedding date is required";
    if (!formData.numberOfGuests || Number(formData.numberOfGuests) < 1) errs.numberOfGuests = "Number of guests must be at least 1";
    if (!formData.venueDetails?.trim()) errs.venueDetails = "Venue details are required";
    if (!formData.contactNumber?.trim()) errs.contactNumber = "Contact number is required";
    else if (!/^[0-9]{10}$/.test(formData.contactNumber)) errs.contactNumber = "Enter a valid 10-digit mobile number";
    if (!formData.email?.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  return (
    <section
      id="wedding"
      className="py-20 bg-gradient-to-b from-gray-900 to-black"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 fade-in">
          <h3 className="text-3xl sm:text-4xl md:text-5xl playfair font-bold text-yellow-400 mb-4">
            Wedding Catering
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">
            Royal treatment for your special day
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="fade-in">
              <h4 className="text-2xl sm:text-3xl playfair font-bold text-yellow-400 mb-6">
                Premium Wedding Packages
              </h4>

              <div className="space-y-6">
                <div className="dark-glass rounded-xl p-5 sm:p-6 border border-yellow-400/20 md:hover:border-yellow-400 md:hover:scale-105 transition-all duration-300 shadow-lg">
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
                <div className="dark-glass rounded-xl p-5 sm:p-6 border border-yellow-400/20 md:hover:border-yellow-400 md:hover:scale-105 transition-all duration-300 shadow-lg">
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
                <div className="dark-glass rounded-xl p-5 sm:p-6 border border-yellow-400/20 md:hover:border-yellow-400 md:hover:scale-105 transition-all duration-300 shadow-lg">
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
              <div className="dark-glass rounded-2xl p-5 sm:p-6 md:p-8">
                <h4 className="text-xl sm:text-2xl playfair font-bold text-yellow-400 mb-6">
                  Wedding Inquiry
                </h4>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <input
                        type="text"
                        name="brideName"
                        value={formData.brideName}
                        onChange={handleInputChange}
                        placeholder="Bride's Name"
                        aria-invalid={!!errors.brideName}
                        className={`bg-black/50 border ${errors.brideName ? 'border-red-500 focus:border-red-500' : 'border-yellow-400/30 focus:border-yellow-400'} rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 focus:outline-none text-white`}
                        required
                      />
                      {errors.brideName && <p className="text-red-500 text-xs mt-1">{errors.brideName}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="groomName"
                        value={formData.groomName}
                        onChange={handleInputChange}
                        placeholder="Groom's Name"
                        aria-invalid={!!errors.groomName}
                        className={`bg-black/50 border ${errors.groomName ? 'border-red-500 focus:border-red-500' : 'border-yellow-400/30 focus:border-yellow-400'} rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 focus:outline-none text-white`}
                        required
                      />
                      {errors.groomName && <p className="text-red-500 text-xs mt-1">{errors.groomName}</p>}
                    </div>
                  </div>

                  <div>
                    <input
                      type="date"
                      name="weddingDate"
                      value={formData.weddingDate}
                      onChange={handleInputChange}
                      aria-invalid={!!errors.weddingDate}
                      className={`w-full bg-black/50 border ${errors.weddingDate ? 'border-red-500 focus:border-red-500' : 'border-yellow-400/30 focus:border-yellow-400'} rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 focus:outline-none text-white`}
                      required
                    />
                    {errors.weddingDate && <p className="text-red-500 text-xs mt-1">{errors.weddingDate}</p>}
                  </div>
                  <div>
                    <input
                      type="number"
                      name="numberOfGuests"
                      value={formData.numberOfGuests}
                      onChange={handleInputChange}
                      placeholder="Number of Guests"
                      aria-invalid={!!errors.numberOfGuests}
                      className={`w-full bg-black/50 border ${errors.numberOfGuests ? 'border-red-500 focus:border-red-500' : 'border-yellow-400/30 focus:border-yellow-400'} rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 focus:outline-none text-white`}
                      min="1"
                      required
                    />
                    {errors.numberOfGuests && <p className="text-red-500 text-xs mt-1">{errors.numberOfGuests}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="Contact Number"
                      inputMode="numeric"
                      pattern="^[0-9]{10}$"
                      maxLength="10"
                      aria-invalid={!!errors.contactNumber}
                      className={`w-full bg-black/50 border ${errors.contactNumber ? 'border-red-500 focus:border-red-500' : 'border-yellow-400/30 focus:border-yellow-400'} rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 focus:outline-none text-white`}
                      required
                    />
                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      aria-invalid={!!errors.email}
                      className={`w-full bg-black/50 border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-yellow-400/30 focus:border-yellow-400'} rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 focus:outline-none text-white`}
                      required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <textarea
                      name="venueDetails"
                      value={formData.venueDetails}
                      onChange={handleInputChange}
                      placeholder="Venue Details"
                      rows="3"
                      aria-invalid={!!errors.venueDetails}
                      className={`w-full bg-black/50 border ${errors.venueDetails ? 'border-red-500 focus:border-red-500' : 'border-yellow-400/30 focus:border-yellow-400'} rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 focus:outline-none text-white`}
                      required
                    ></textarea>
                    {errors.venueDetails && <p className="text-red-500 text-xs mt-1">{errors.venueDetails}</p>}
                  </div>

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
