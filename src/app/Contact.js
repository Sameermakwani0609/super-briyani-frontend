"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
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
        type: "contact",
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        createdAt: serverTimestamp(),
        status: "new",
      };

      await addDoc(collection(db, "inquiries"), inquiryData);

      setSubmitMessage(
        "Message sent successfully! We'll get back to you soon."
      );
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitMessage("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = "Name is required";
    if (!formData.email?.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errs.email = "Enter a valid email";
    if (!formData.subject?.trim()) errs.subject = "Subject is required";
    if (!formData.message?.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl playfair font-bold text-yellow-400 mb-4">
            Contact Us
          </h3>
          <p className="text-lg md:text-xl text-gray-300">
            Get in touch for reservations and inquiries
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Visit Info / Contact Info */}
          <div>
            <h4 className="text-2xl playfair font-bold text-yellow-400 mb-6">
              Visit Our Restaurant
            </h4>
            <div className="space-y-4 mb-8">
              {/* Address */}
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-yellow-400 transform-none" />
                <span>123 Food Street, Akola</span>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-3">
                <FaPhoneAlt className="text-yellow-400 transform-none" />
                <span>+91 9876543210</span>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-yellow-400 transform-none" />
                <span suppressHydrationWarning>order@superbriyani.com</span>
              </div>

              {/* Timing */}
              <div className="flex items-center space-x-3">
                <FaClock className="text-yellow-400 transform-none" />
                <span>Daily 11:00 AM - 11:00 PM</span>
              </div>
            </div>

            {/* Social Icons (Only Instagram & WhatsApp) */}
            <div className="flex space-x-3 sm:space-x-4 mt-4">
              {[
                { icon: <FaInstagram />, color: "#E1306C" },
                { icon: <FaWhatsapp />, color: "#25D366" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-110"
                  style={{ backgroundColor: social.color }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="dark-glass rounded-2xl p-6 md:p-8">
            <h4 className="text-2xl playfair font-bold text-yellow-400 mb-6">
              Send us a Message
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    aria-invalid={!!errors.name}
                    className={`bg-black/50 border ${
                      errors.name
                        ? "border-red-500 focus:border-red-500"
                        : "border-yellow-400/30 focus:border-yellow-400"
                    } rounded-lg px-4 py-3 focus:outline-none text-white`}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    aria-invalid={!!errors.email}
                    className={`bg-black/50 border ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-yellow-400/30 focus:border-yellow-400"
                    } rounded-lg px-4 py-3 focus:outline-none text-white`}
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Subject"
                aria-invalid={!!errors.subject}
                className={`w-full bg-black/50 border ${
                  errors.subject
                    ? "border-red-500 focus:border-red-500"
                    : "border-yellow-400/30 focus:border-yellow-400"
                } rounded-lg px-4 py-3 focus:outline-none text-white`}
                required
              />
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
              )}
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Your Message"
                rows="5"
                aria-invalid={!!errors.message}
                className={`w-full bg-black/50 border ${
                  errors.message
                    ? "border-red-500 focus:border-red-500"
                    : "border-yellow-400/30 focus:border-yellow-400"
                } rounded-lg px-4 py-3 focus:outline-none text-white`}
                required
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}

              {submitMessage && (
                <div
                  className={`p-3 rounded-lg text-center ${
                    submitMessage.includes("successfully")
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {submitMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <FaSpinner className="mr-2 animate-spin" />
                ) : (
                  <FaPaperPlane className="mr-2" />
                )}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
