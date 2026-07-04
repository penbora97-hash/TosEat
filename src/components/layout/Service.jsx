import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaTruck,
  FaUtensils,
  FaClock,
  FaHeadset,
  FaShieldAlt,
  FaStar,
  FaCreditCard,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaRegClock,
} from "react-icons/fa";
import { HiOutlineLocationMarker, HiOutlineMail } from "react-icons/hi";
import {
  MdDeliveryDining,
  MdRestaurant,
  MdPayments,
  MdLocalPhone,
} from "react-icons/md";

const Service = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const services = [
    {
      id: 1,
      icon: <FaTruck className="text-4xl" />,
      title: "Fast Delivery",
      description:
        "Get your food delivered to your doorstep within 30 minutes. Track your order in real-time.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: 2,
      icon: <FaUtensils className="text-4xl" />,
      title: "Quality Food",
      description:
        "We source fresh ingredients from local farms to ensure the highest quality meals.",
      color: "from-orange-500 to-red-500",
    },
    {
      id: 3,
      icon: <FaClock className="text-4xl" />,
      title: "24/7 Service",
      description:
        "Order anytime, day or night. We are always ready to serve you delicious meals.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: 4,
      icon: <FaHeadset className="text-4xl" />,
      title: "Customer Support",
      description:
        "Our dedicated support team is available 24/7 to help with any questions or issues.",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 5,
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Secure Payment",
      description:
        "Multiple payment options with industry-standard encryption for your security.",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 6,
      icon: <FaStar className="text-4xl" />,
      title: "Premium Quality",
      description:
        "We maintain the highest standards in food preparation and customer service.",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Choose Your Food",
      description:
        "Browse through our extensive menu and select your favorite dishes.",
      icon: <MdRestaurant className="text-3xl" />,
    },
    {
      number: "02",
      title: "Place Your Order",
      description:
        "Customize your order, choose delivery time, and complete payment.",
      icon: <FaCreditCard className="text-3xl" />,
    },
    {
      number: "03",
      title: "Track Your Delivery",
      description:
        "Get real-time updates on your order status and delivery progress.",
      icon: <MdDeliveryDining className="text-3xl" />,
    },
    {
      number: "04",
      title: "Enjoy Your Meal",
      description:
        "Receive your food hot and fresh. Rate and review your experience.",
      icon: <FaUtensils className="text-3xl" />,
    },
  ];

  const stats = [
    { number: "50+", label: "Restaurants" },
    { number: "200+", label: "Menu Items" },
    { number: "1000+", label: "Happy Customers" },
    { number: "4.8", label: "Average Rating" },
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        type: "error",
        message: "Please fill in all fields.",
      });
      return;
    }
    // Submit logic here
    setFormStatus({
      type: "success",
      message: "Message sent successfully! We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => {
      setFormStatus(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ─── HERO SECTION ─── */}
      <section className="relative bg-gradient-to-r from-emerald-900/50 to-teal-900/50 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Our Services
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto"
          >
            We provide the best food delivery experience with quality, speed,
            and convenience.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
            >
              Explore Menu
              <FaUtensils className="text-sm" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-emerald-400">
                  {stat.number}
                </div>
                <div className="text-slate-400 text-sm md:text-base mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES GRID ─── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              What We <span className="text-emerald-400">Offer</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Discover our range of services designed to make your food
              experience exceptional.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800 rounded-2xl p-6 hover:transform hover:scale-[1.02] transition-all duration-300 group border border-slate-700/50 hover:border-emerald-500/50"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center text-white mb-4 group-hover:rotate-6 transition`}
                >
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {service.description}
                </p>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-1 text-emerald-400 text-sm mt-3 hover:text-emerald-300 transition group-hover:translate-x-1"
                >
                  Learn More →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              How It <span className="text-emerald-400">Works</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get your favorite food delivered in four simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-[40%] h-[2px] bg-emerald-500/20">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 absolute -right-1.5 top-1/2 -translate-y-1/2"></div>
                  </div>
                )}
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                  {step.number}
                </div>
                <div className="text-emerald-400 text-4xl mb-3 flex justify-center">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FIND US SECTION ─── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Find <span className="text-emerald-400">Us</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Visit us at our location or get in touch with us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Address */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Address
                    </h3>
                    <p className="text-slate-400">
                      Street 271, Tuol Kork, Phnom Penh, Cambodia
                    </p>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FaRegClock className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Opening Hours
                    </h3>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-sm">
                        <span className="text-white font-medium">
                          Monday – Friday:
                        </span>{" "}
                        7:00 AM – 10:00 PM
                      </p>
                      <p className="text-slate-400 text-sm">
                        <span className="text-white font-medium">
                          Saturday – Sunday:
                        </span>{" "}
                        8:00 AM – 11:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <MdLocalPhone className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Phone
                    </h3>
                    <p className="text-slate-400">+855 12 345 678</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Email
                    </h3>
                    <p className="text-slate-400">foodanddrinks@gmail.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50"
            >
              <div className="p-4 bg-slate-800 border-b border-slate-700/50">
                <h3 className="text-white font-semibold text-lg">
                  Location Map
                </h3>
              </div>
              <div className="h-[400px] bg-slate-700/30 relative">
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.676514373202!2d104.892575775021!3d11.576895843088523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109516b5bb8c7b3%3A0x7b8d8f8d8f8d8f8d!2sPhnom%20Penh%2C%20Cambodia!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Restaurant Location"
                  className="w-full h-full"
                  onLoad={() => setMapLoaded(true)}
                ></iframe>

                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        TosEat Restaurant
                      </p>
                      <p className="text-slate-400 text-xs">
                        Street 271, Tuol Kork, Phnom Penh
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Why Choose <span className="text-emerald-400">Us</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We are committed to providing the best food delivery experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FaTruck className="text-2xl" />,
                title: "Free Delivery",
                description: "Free delivery on orders over $15",
              },
              {
                icon: <FaClock className="text-2xl" />,
                title: "Fast Service",
                description: "Average delivery time of 25 minutes",
              },
              {
                icon: <FaShieldAlt className="text-2xl" />,
                title: "Secure Payment",
                description: "100% secure payment methods",
              },
              {
                icon: <FaUtensils className="text-2xl" />,
                title: "Fresh Food",
                description: "Prepared with fresh ingredients",
              },
              {
                icon: <FaHeadset className="text-2xl" />,
                title: "24/7 Support",
                description: "Customer support anytime",
              },
              {
                icon: <FaStar className="text-2xl" />,
                title: "Best Quality",
                description: "Highest quality standards",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center gap-4 bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition border border-slate-700/50"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Get In <span className="text-emerald-400">Touch</span>
              </h2>
              <p className="text-slate-400 mb-6">
                Have questions or need help? We'd love to hear from you.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-slate-400">
                      Street 271, Tuol Kork, Phnom Penh, Cambodia
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-slate-400">+855 12 345 678</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-slate-400">
                      foodanddrinks@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-700 hover:bg-emerald-500 flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <FaFacebook />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-700 hover:bg-emerald-500 flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-700 hover:bg-emerald-500 flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <FaTwitter />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-700 hover:bg-emerald-500 flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <FaYoutube />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Send Us a Message
              </h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition resize-none"
                  ></textarea>
                </div>
                {formStatus && (
                  <div
                    className={`p-3 rounded-xl text-sm ${
                      formStatus.type === "success"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/20 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {formStatus.message}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Service;
