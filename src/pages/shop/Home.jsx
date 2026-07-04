import React from "react";
import Navbar from "/src/pages/shop/Navbar.jsx";
import Banner from "/src/pages/shop/Banner"
import Card from "/src/pages/shop/Card"
import Food from "./Food-scroll";
const Home = () => {
  return <div>
    <div className="min-h-screen  bg-gray-900 selection:bg-violet-500/30 scroll-smooth">
    <Banner/>
    <div className="mt-8">
      <Food/>
    </div>
   <div className="mt-11 ">
     <Card/>
   </div>
    </div>
  </div>;
};

export default Home;

