import React from 'react';
import Image from 'next/image';

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-24">
      {/* Text content */}
      <div className="w-full md:w-1/2 mb-8 md:mb-0 text-xl flex flex-wrap gap-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          RORRO: Simplify Your Team&apos;s Turnover
        </h1>
        <p>
          Revolutionize user rotations in Slack with RORRO.
          Your ultimate tool for seamless team scheduling.
        </p>
        <p>
          Designed for teams of all sizes
          Wheters you&apos;re managing shifts, task assignments, or rotating team roles, RORRO makes the process smooth and efficient.
        </p>
        <button className="bg-primary font-bold py-3 px-6 rounded-lg hover:bg-primary transition duration-300">
          Get Started
        </button>
      </div>

      {/* Image */}
      <div className="w-full md:w-1/2 relative h-auto">
        <Image className='bottom-0 left-4 absolute hidden md:block rounded-lg shadow-xl' src={'/images/dashboard.png'} alt='Rotation' height={200} width={500} />
        <Image className='top-5 absolute rounded-xl shadow-xl' src={'/images/rotation-post.png'} alt='Rotation' height={100} width={350} />
        <Image className='right-0 -top-8 absolute rounded-lg shadow-xl' src={'/images/on-duty-get.png'} alt='Rotation' height={150} width={400} />
      </div>
    </div>
  );
};

export default Hero;
