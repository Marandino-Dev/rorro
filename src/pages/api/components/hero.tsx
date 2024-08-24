import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-24">
      {/* Text content */}
      <div className="w-full md:w-1/2 mb-8 md:mb-0 text-xl flex flex-wrap gap-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 capitalize">
          <span className='text-primary'>RORRO</span>: Equitable Task Distribution
        </h1>
        <p>
          Automate, rotate, and elevate your team&apos;s task management with one tool.
        </p>
        <p>
          Effortless workload balance: A Slack bot designed for fairness
        </p>

        <Link
          href="https://slack.com/oauth/v2/authorize?scope=channels%3Aread%2Cusergroups%3Aread%2Cusers%3Aread%2Cchat%3Awrite%2Ccommands&amp;user_scope=&amp;redirect_uri=https%3A%2F%2Fdevelopment-rorro.vercel.app%2Fapi%2Fv1%2Fslack%2Fconfirmation&amp;client_id=7546053177520.7516636957142"
        >
          <button className="bg-primary font-bold py-3 px-6 rounded-lg hover:bg-primary transition duration-300">
            Get Started
          </button>
        </Link>
      </div>

      {/* Image */}
      <div className="w-full md:w-1/2 relative h-auto">
        <Image className='bottom-0 left-4 absolute hidden md:block rounded-lg shadow-xl' src={'/images/dashboard.png'} alt='Rotation' height={200} width={500} />
        <Image className='top-5 absolute rounded-xl shadow-xl' src={'/images/rotation-post.png'} alt='Rotation' height={100} width={350} />
        <Image className='right-0 -top-8 absolute rounded-lg shadow-xl' src={'/images/on-duty-get.png'} alt='Rotation' height={150} width={400} />
      </div>
    </div >
  );
};

export default Hero;
