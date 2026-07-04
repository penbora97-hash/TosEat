// About.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaUsers,
  FaStar,
  FaHeart,
  FaAward,
  FaLeaf,
  FaTruck,
  FaClock,
  FaShieldAlt,
  FaQuoteLeft,
  FaQuoteRight,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";
import {
  MdRestaurant,
  MdEmojiFoodBeverage,
  MdLocalDrink,
} from "react-icons/md";

const About = () => {
  const stats = [
    {
      number: "10+",
      label: "Years Experience",
      icon: <FaAward className="text-3xl" />,
    },
    {
      number: "50+",
      label: "Expert Chefs",
      icon: <FaUtensils className="text-3xl" />,
    },
    {
      number: "200+",
      label: "Menu Items",
      icon: <MdRestaurant className="text-3xl" />,
    },
    {
      number: "1000+",
      label: "Happy Customers",
      icon: <FaUsers className="text-3xl" />,
    },
  ];

  const values = [
    {
      icon: <FaHeart className="text-3xl" />,
      title: "Passion for Food",
      description:
        "We pour our heart into every dish, using traditional recipes and modern techniques.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: <FaLeaf className="text-3xl" />,
      title: "Fresh Ingredients",
      description:
        "We source locally grown, organic ingredients to ensure the highest quality meals.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Community First",
      description:
        "We believe in giving back to our community and supporting local farmers.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: <FaStar className="text-3xl" />,
      title: "Quality Service",
      description:
        "We are committed to providing exceptional service and memorable dining experiences.",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const team = [
    {
      name: "Chef Akaza",
      role: "Executive Chef",
      image:
        "https://ui-avatars.com/api/?name=Akaza&background=10b981&color=fff&size=200",
      description:
        "20 years of culinary experience with a passion for Cambodian cuisine.",
    },
    {
      name: "Sophea Kim",
      role: "Head of Operations",
      image:
        "https://ui-avatars.com/api/?name=Sophea+Kim&background=10b981&color=fff&size=200",
      description: "Expert in restaurant management and customer experience.",
    },
    {
      name: "Vannak Sok",
      role: "Master Chef",
      image:
        "https://ui-avatars.com/api/?name=Vannak+Sok&background=10b981&color=fff&size=200",
      description: "Specialist in traditional Khmer and Asian fusion cuisine.",
    },
    {
      name: "Maly Rath",
      role: "Pastry Chef",
      image:
        "https://ui-avatars.com/api/?name=Maly+Rath&background=10b981&color=fff&size=200",
      description:
        "Award-winning pastry chef with a creative approach to desserts.",
    },
  ];

  const testimonials = [
    {
      name: "Sokha Vann",
      role: "Regular Customer",
      comment:
        "The best food delivery service in Phnom Penh! The food is always fresh and delicious.",
      rating: 5,
    },
    {
      name: "David Chen",
      role: "Tourist",
      comment:
        "I tried the Lok Lak and it was incredible! Highly recommend this restaurant.",
      rating: 5,
    },
    {
      name: "Maria Santos",
      role: "Food Blogger",
      comment:
        "A hidden gem in the city. The flavors are authentic and the service is top-notch.",
      rating: 5,
    },
  ];

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
            About{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Us
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto"
          >
            We are passionate about bringing the authentic flavors of Cambodia
            to your doorstep. Our mission is to deliver delicious, high-quality
            meals that tell a story.
          </motion.p>
        </div>
      </section>

      {/* ─── OUR STORY ─── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Our <span className="text-emerald-400">Story</span>
              </h2>
              <p className="text-slate-400 mb-4 leading-relaxed">
                Founded in 2015, TosEat began with a simple vision: to share the
                rich culinary heritage of Cambodia with the world. What started
                as a small family restaurant has grown into a beloved food
                delivery service serving thousands of customers.
              </p>
              <p className="text-slate-400 mb-6 leading-relaxed">
                We take pride in using traditional recipes passed down through
                generations, combined with fresh, locally sourced ingredients.
                Every dish we prepare tells a story of Cambodia's vibrant
                culture and culinary excellence.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-slate-800 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    AK
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-slate-800 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    SK
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-slate-800 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    VS
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-slate-800 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    MR
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold">Our Team</p>
                  <p className="text-slate-400 text-sm">50+ Expert Chefs</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-slate-800 rounded-2xl overflow-hidden h-48">
                    <img
                      src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop"
                      alt="Restaurant interior"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-slate-800 rounded-2xl overflow-hidden h-48">
                    <img
                      src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop"
                      alt="Food preparation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-slate-800 rounded-2xl overflow-hidden h-48">
                    <img
                      src="https://images.unsplash.com/photo-1581299894007-fff50297d5b1?w=400&h=300&fit=crop"
                      alt="Cooking"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-slate-800 rounded-2xl overflow-hidden h-48">
                    <img
                      src="https://images.unsplash.com/photo-1559339352-11d5e6129b65?w=400&h=300&fit=crop"
                      alt="Dish presentation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center bg-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition"
              >
                <div className="text-emerald-400 flex justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {stat.number}
                </div>
                <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OUR VALUES ─── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Our <span className="text-emerald-400">Values</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The principles that guide everything we do at TosEat.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800 rounded-2xl p-6 text-center hover:transform hover:scale-[1.02] transition-all duration-300 border border-slate-700/50 group"
              >
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${value.color} flex items-center justify-center text-white mx-auto mb-4 group-hover:rotate-6 transition`}
                >
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MEET OUR TEAM ─── */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Meet Our <span className="text-emerald-400">Team</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The talented individuals behind your favorite dishes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-700">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-white font-semibold text-lg">
                    {member.name}
                  </h3>
                  <p className="text-emerald-400 text-sm mb-2">{member.role}</p>
                  <p className="text-slate-400 text-sm">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              What Our <span className="text-emerald-400">Customers Say</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Hear from our satisfied customers about their experience with
              TosEat.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition"
              >
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-sm" />
                  ))}
                </div>
                <div className="relative">
                  <FaQuoteLeft className="text-emerald-500/20 text-2xl absolute -top-1 -left-1" />
                  <p className="text-slate-300 text-sm leading-relaxed pl-6">
                    {testimonial.comment}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience{" "}
              <span className="text-emerald-400">TosEat</span>?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Join thousands of satisfied customers and order your favorite
              dishes today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/menu"
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20"
              >
                Explore Our Menu
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition border border-slate-700"
              >
                Contact Us
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-8">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-500 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaFacebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-500 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaInstagram />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-500 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaTwitter />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-500 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaYoutube />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-emerald-500 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaLinkedin />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
