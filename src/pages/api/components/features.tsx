import React from 'react';
import { FaSlack, FaClock, FaSuitcase, FaAddressCard, FaSlidersH, } from 'react-icons/fa';
import { GiIsland, GiPadlock, GiPlanetConquest } from 'react-icons/gi';


interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureBoxProps {
  feature: Feature;
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ feature }) => (
  <div className="p-6 rounded-lg shadow-md flex flex-col items-center text-center">
    <div className="text-4xl mb-4">{feature.icon}</div>
    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
    <p className="">{feature.description}</p>
  </div>
);

const FeaturesGrid: React.FC = () => {
  const features: Feature[] = [
    { icon: <FaSlack />, title: 'All in Slack', description: 'Do everything in Slack, no need to leave the app.' },
    { icon: <FaClock />, title: 'Scheduled rotations', description: 'Scheduled rotations for automatic assignements.' },
    { icon: <FaSuitcase />, title: 'Workday rotations', description: 'Rotate on a per workday basis, for example, Monday to Friday.' },
    { icon: <FaAddressCard />, title: 'Holidays and weekends', description: 'Full holidays and festivals support, to skip duty when you should rest!' },
    { icon: <FaSlidersH />, title: 'Multi-duty rotations', description: 'Set multiple users on duty at the same time.' },
    { icon: <GiIsland />, title: 'Vacation mode', description: 'Skip duty based on your status. For example, when you are on vacation.' },
    { icon: <GiPadlock />, title: 'Privacy and control', description: 'Control access to rotations, and keep your data private.' },
    { icon: <GiPlanetConquest />, title: 'Timezones', description: 'Full support for timezones to rotate always at the right time.' },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Awesome Features</h2>
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
