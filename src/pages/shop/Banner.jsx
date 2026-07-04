import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { FaArrowRight, FaStar, FaClock, FaTruck } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import { foodImages } from "../../banner_food";
export default function FoodBanner() {
  const [activeIndex, setActiveIndex] = useState(0);


  return (
    <div className="w-full max-w-8xl mx-auto px-3 md:px-6 pt-4 md:pt-8">
      {/* Main Banner */}
      <div className="w-full h-[490px] md:h-[600px] lg:h-[680px] relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/50">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade, Navigation]}
          effect={"fade"}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            renderBullet: (index, className) => {
              return `<span class="${className} !bg-white/60 !w-3 !h-3 !opacity-60 hover:!opacity-100 transition-all"></span>`;
            },
          }}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full h-full"
        >
          {foodImages.map((item, index) => (
            <SwiperSlide key={index} className="w-full h-full relative">
              {/* Background Image with Parallax Effect */}
              <div
                className="w-full h-full relative overflow-hidden"
                style={{
                  backgroundImage: `url(${item.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: `scale(${activeIndex === index ? 1.05 : 1})`,
                  transition: "transform 8s ease-out",
                }}
              >
                {/* Gradient Overlay - Multi-layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_transparent_30%,_black/40)]" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-20">
                <div className="max-w-2xl">
                  {/* Animated Badge */}
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/30 mb-4 animate-pulse">
                    <span className="text-emerald-400 text-lg">
                      {item.badge.split(" ")[0]}
                    </span>
                    <span className="text-white text-sm font-medium">
                      {item.badge.split(" ").slice(1).join(" ")}
                    </span>
                  </div>

                  {/* Title with Gradient */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-emerald-200 drop-shadow-2xl">
                    {item.title}
                  </h1>

                  {/* Subtitle */}
                 

              

                  {/* CTA Buttons with Animation */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm md:text-base px-6 md:px-8 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-95 overflow-hidden">
                     <Link to="/menu"> <span className="relative z-10 flex items-center gap-5">
                        Order Now
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />
                      </span></Link>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                
                  </div>
                </div>
              </div>

              {/* Slide Indicator */}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation - Only visible on desktop */}
        <button className="custom-prev absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 hidden md:flex">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button className="custom-next absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 hidden md:flex">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Animated Particles / Decoration */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>
    </div>
  );
}
