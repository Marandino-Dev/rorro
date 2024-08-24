import React from 'react';

interface PricingPlan {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  isPremium: boolean;
}

interface PricingCardProps extends PricingPlan { }

const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, buttonText, isPremium }) => (
  <div className={`rounded-lg shadow-xl p-5 px-12 flex flex-wrap gap-2 md:gap-4 ${!isPremium ? '' : ''}`}>
    <div className='font-bold'>
      <h2 className='text-2xl md:text-3xl' >{title}</h2>
      <h2 className="text-xl md:text-2xl text-primary">
        {price}<span className='text-base opacity-80 text-dark dark:text-black'> user / month</span>
      </h2>
    </div>
    <ul className="flex flex-wrap -ml-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <span>
            <svg className="h-5 w-5 text-secondary mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </span>
          {feature}
        </li>
      ))}
    </ul>
    <button className={'btn primary capitalize'}>
      {buttonText}
    </button>
  </div>
);

const Pricing: React.FC = () => {
  const pricingPlans: PricingPlan[] = [
    {
      title: 'Starter',
      price: '$0.00',
      features: [
        'Unlimited users per rotation',
        'Unlimited task rotations',
        'Vacation mode to skip unavailable users',
        'Seamless slack integration',
        'Emergency options: re-assign or revert tasks instantly',
        'Comprehensive logs for full transparency',
        'Insightful dashboard with user stats',
      ],
      buttonText: 'try it now',
      isPremium: false
    },
    {
      title: 'Pro',
      price: '$1.99',
      features: [
        'Unlimited users per rotation',
        'Unlimited task rotations',
        'Vacation mode to skip unavailable users',
        'Seamless slack integration',
        'Emergency options: re-assign or revert tasks instantly',
        'Comprehensive logs for full transparency',
        'Insightful dashboard with user stats',
      ],
      buttonText: 'install to slack',
      isPremium: true
    }
  ];

  return (
    <section id='pricing' className='bg-dark-bg md:dark:bg-tertiary text-dark md:-mx-96 dark:text-black md:py-12 overflow-x-hidden'>
      <h1 className="text-3xl font-bold text-center mb-8 hidden md:block">Choose Your Plan</h1>
      <div className="flex flex-col md:flex-row justify-center items-stretch space-y-6 md:space-y-0 md:space-x-6">
        {pricingPlans.map((plan, index) => (
          <div key={index} className="w-full md:w-80 bg-light-bg rounded-lg">
            <PricingCard {...plan} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
