import React from 'react';

const Hero = () => {
  return (
    <div className="bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-24">
          {/* Text content */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              RORRO: Simplify Your Team&apos;s Turnover
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Revolutionize user rotations in Slack with RORRO.
              Your ultimate tool for seamless team scheduling.
            </p>
            <p className='text-xl text-gray-600 mb-6'> 
              Designed for teams of all sizes
              Wheters you&apos;re managing shifts, task assignments, or rotating team roles, RORRO makes the process smooth and efficient.
            </p>
            <button className="bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition duration-300">
              Get Started
            </button>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2">
            <img 
              src="https://w7.pngwing.com/pngs/101/158/png-transparent-laptop-logo-show-logo-wanted-computer-50-electronics-computer-logo.png" 
              alt="RORRO App Interface" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
