import React from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaTelegramPlane } from "react-icons/fa";
import { CiLocationOn, CiPhone, CiMail } from "react-icons/ci";

function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              
              <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
                TosEat
              </h2>
            </div>
            
            <p className="text-gray-500 leading-relaxed max-w-md">
             Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate cum corporis veritatis optio tempora quas pariatur odit deserunt vitae voluptas adipisci excepturi aperiam quo voluptates beatae rem non, minus laborum.
            </p>

            <div className="mt-8 flex gap-4">
              <a href="https://www.facebook.com/share/1JqMrE32ao/" className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors">
                <FaFacebookF className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors">
                <FaTiktok className="text-xl" />
              </a>
              <a href="https://t.me/pen_bora" className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-xl flex items-center justify-center transition-colors">
                <FaTelegramPlane className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Home</a></li>
              <li><a href="/menu" className="hover:text-emerald-400 transition-colors">Menu</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Our Services</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Track Order</a></li>
              <li><a href="/about" className="hover:text-emerald-400 transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Delivery Areas</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CiLocationOn className="text-emerald-500 text-2xl mt-0.5" />
                <div>
                  <p>Phnom Penh, Cambodia</p>
                  <p className="text-sm text-gray-500">Street 123, Boeng Keng Kang</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CiPhone className="text-emerald-500 text-2xl" />
                <p>012 345 678 / 098 765 432</p>
              </div>
              <div className="flex items-center gap-3">
                <CiMail className="text-emerald-500 text-2xl" />
                <p>support@toseat.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2026 TosEat. All Rights Reserved.</p>
          <p className="mt-3 md:mt-0">Made for International  Food Lovers</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;   