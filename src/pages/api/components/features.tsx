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
  index: number;
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ feature, index }) => (
  <div className={`p-6 rounded-lg shadow-md flex flex-col items-center text-center  ${index > 3 && 'hidden md:flex'}`}>
    <div className="text-4xl mb-4">{feature.icon}</div>
    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
    <p className="opacity-70">{feature.description}</p>
  </div>
);

const FeaturesGrid: React.FC = () => {
  const features: Feature[] = [
    { icon: <FaSlack />, title: 'Slack-Native', description: 'Manage rotations without leaving Slack.' },
    { icon: <FaSlidersH />, title: 'Multi-User Duty', description: 'Assign multiple users simultaneously for complex tasks.' },
    { icon: <FaAddressCard />, title: 'Holiday-Aware', description: 'Skip assignments on holidays and weekends automatically.' },
    { icon: <GiIsland />, title: 'Smart Availability', description: 'Auto-skip users based on vacation or status updates.' },
    { icon: <GiPadlock />, title: 'Secure & Private', description: 'Full control over rotation access and data privacy.' },
    { icon: <FaSuitcase />, title: 'Workday Focus', description: 'Customize rotations for business days (e.g., Monday-Friday).' },
    { icon: <FaClock />, title: 'Automated Scheduling', description: 'Set it and forget it - assignments happen automatically.' },
    { icon: <GiPlanetConquest />, title: 'Global-Friendly', description: 'Timezone support ensures timely rotations worldwide.' }
  ];

  return (
    <section>
      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center hidden md:block mb-8">Awesome Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
          {features.map((feature, index) => (
            <FeatureBox key={index} index={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
