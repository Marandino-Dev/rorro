import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureBoxProps {
  feature: Feature;
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ feature }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
    <div className="text-4xl mb-4">{feature.icon}</div>
    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
    <p className="text-gray-600">{feature.description}</p>
  </div>
);

const FeaturesGrid: React.FC = () => {
  const features: Feature[] = [
    { icon: '🚀', title: 'Fast Performance', description: 'Lightning-fast load times for a smooth user experience.' },
    { icon: '🔒', title: 'Secure', description: 'Top-notch security to keep your data safe and protected.' },
    { icon: '📱', title: 'Responsive', description: 'Looks great on any device, from mobile to desktop.' },
    { icon: '🔍', title: 'SEO Optimized', description: 'Boost your visibility with our SEO-friendly design.' },
    { icon: '🔧', title: 'Customizable', description: 'Easily adapt the app to fit your specific needs.' },
    { icon: '🔄', title: 'Regular Updates', description: 'Constant improvements and new features added regularly.' },
    { icon: '💬', title: '24/7 Support', description: 'Our team is always here to help you succeed.' },
    { icon: '📊', title: 'Analytics', description: 'Gain insights with comprehensive analytics and reporting.' },
  ];

  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Awesome Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureBox key={index} feature={feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesGrid;
