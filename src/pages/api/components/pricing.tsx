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
  <div className={`rounded-lg shadow-lg p-6 ${!isPremium ? 'border-2 border-secondary' : ''}`}>
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-4xl font-bold text-primary mb-6">{price}</p>
    <ul className="mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center mb-2">
          <svg className="h-5 w-5 text-secondary mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <button className={`w-full py-2 px-4 rounded-lg font-bold transition duration-300 ${isPremium
      ? 'bg-primary opacity-80 hover:opacity-100'
      : 'bg-secondary dark:text-dark'
      }`}>
      {buttonText}
    </button>
  </div>
);

const Pricing: React.FC = () => {
  const pricingPlans: PricingPlan[] = [
    {
      title: 'Free',
      price: '$0/month',
      features: [
        '-----',
        '-----',
        '-----',
      ],
      buttonText: 'Get Started',
      isPremium: false
    },
    {
      title: 'Premium',
      price: '$1/month',
      features: [
        '-----',
        '-----',
        '-----',
        '-----',
        '-----',
      ],
      buttonText: 'Upgrade Now',
      isPremium: true
    }
  ];

  return (
    <section>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
        <div className="flex flex-col md:flex-row justify-center items-stretch space-y-6 md:space-y-0 md:space-x-6">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="w-full md:w-80">
              <PricingCard {...plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
