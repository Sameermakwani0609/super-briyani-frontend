"use client";

import {
  FaMapMarkerAlt,
  FaPhoneAlt, // Updated icon
  FaEnvelope,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Contact() {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-5xl playfair font-bold text-yellow-400 mb-4">
            Contact Us
          </h3>
          <p className="text-xl text-gray-300">
            Get in touch for reservations and inquiries
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
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
            <div className="flex space-x-4 mt-4">
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
          <div className="dark-glass rounded-2xl p-8">
            <h4 className="text-2xl playfair font-bold text-yellow-400 mb-6">
              Send us a Message
            </h4>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
              />
              <textarea
                placeholder="Your Message"
                rows="5"
                className="w-full bg-black/50 border border-yellow-400/30 rounded-lg px-4 py-3 focus:border-yellow-400 focus:outline-none"
              ></textarea>
              <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center">
                <FaPaperPlane className="mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
