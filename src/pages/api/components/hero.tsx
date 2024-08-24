import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import anime from 'animejs';
import rotationPostImage from '/public/images/rotation-post.png';
import dashboardImage from '/public/images/dashboard.png';
import onDutyGetImage from '/public/images/on-duty-get.png';

const TextWrapper = ({ text }: { text: string }) => {
  // Split the text into individual letters and wrap each one in a span
  const wrappedText = text.split('').map((letter, index) => (
    <span key={index} className="letter inline-block">
      {letter}
    </span>
  ));

  return (
    <span id='rorroHero' className="letters text-primary hover:text-secondary relative inline-flex pr-2">
      <span className='relative inline-block overflow-hidden'>
        {wrappedText}
      </span>
    </span>);
};

const Hero = () => {

  useEffect(() => {
    anime.timeline({ loop: false })
      .add({
        targets: '.letter',
        translateY: ['1.1em', 0],
        translateZ: 0,
        duration: 750,
        delay: (_, i) => 50 * i
      });
  }, []);
  return (
    <section className="flex flex-col md:flex-row items-center justify-between py-12 md:py-24">
      {/* Text content */}
      <div className="w-full md:w-1/2 mb-8 md:mb-0 text-xl flex flex-wrap gap-4">
        <h1 className="text-4xl md:text-5xl font-bold md:mb-4 capitalize">
          <TextWrapper text="RORRO: " />
          Equitable Task Distribution
        </h1>
        <p>
          Automate, rotate, and elevate your team&apos;s task management with one tool.
        </p>
        <p>
          Effortless workload balance: A Slack bot designed for fairness
        </p>

        <Link
          className='flex mt-4 w-full justify-end pr-4 md:block'
          href="https://slack.com/oauth/v2/authorize?scope=channels%3Aread%2Cusergroups%3Aread%2Cusers%3Aread%2Cchat%3Awrite%2Ccommands&amp;user_scope=&amp;redirect_uri=https%3A%2F%2Fdevelopment-rorro.vercel.app%2Fapi%2Fv1%2Fslack%2Fconfirmation&amp;client_id=7546053177520.7516636957142"
        >
          <button className="btn primary">
            Get Started
          </button>
        </Link>
      </div>

      {/* Image */}
      <div className="w-full md:w-1/2 relative h-auto hidden md:block">
        <Image className='bottom-0 left-4 absolute hidden md:block rounded-lg shadow-xl' src={dashboardImage} alt='A screenshot of a dashboard with users' />
        <Image className='top-5 absolute rounded-xl shadow-xl' src={rotationPostImage} alt='An image of the bot creating a new task rotation' />
        <Image priority className='right-0 -top-8 absolute rounded-lg shadow-xl' src={onDutyGetImage} alt='Screenshot showing the users that are on duty for a task' />
      </div>
    </section >
  );
};

export default Hero;
