import React from 'react'
import { foodItems } from '../../food_scroll';
const Food = () => {
  
  return (
    <div className="py-10 px-4 rounded-2xl ">
      <h2 className="text-4xl font-bold text-center text-white mb-8  uppercase">
        Recommand Best Food For You
      </h2>
      
      <marquee 
        behavior="scroll" 
        direction="left" 
        scrollamount="8"
        className="py-4"
      >
        {foodItems.map((item) => (
          <span key={item.id} className="inline-block mx-6">
            <div className="inline-flex items-center gap-4 bg-gray-800 backdrop-blur-sm rounded-2xl shadow-xl">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-130 h-75 object-cover rounded-xl shadow-md"
              />
             
            </div>
          </span>
        ))}
      </marquee>
    </div>
  )
}

export default Food