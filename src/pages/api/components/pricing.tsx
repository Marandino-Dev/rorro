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
  <div className={`bg-white rounded-lg shadow-lg p-6 ${!isPremium ? 'border-2 border-primary' : ''}`}>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    <p className="text-4xl font-bold text-primary mb-6">{price}</p>
    <ul className="mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center mb-2">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <button className={`w-full py-2 px-4 rounded-lg font-bold transition duration-300 ${isPremium
      ? 'bg-primary text-white hover:bg-primary'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Choose Your Plan</h1>
        <div className="flex flex-col md:flex-row justify-center items-stretch space-y-6 md:space-y-0 md:space-x-6">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="w-full md:w-80">
              <PricingCard {...plan} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
