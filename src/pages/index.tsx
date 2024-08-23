import Head from "next/head";
import Hero from "./api/components/hero";
import Pricing from "./api/components/pricing";
import FeaturesGrid from "./api/components/features";
import Navbar from "./api/components/navbar";

export default function App() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <Pricing />
    </>
  );
}

