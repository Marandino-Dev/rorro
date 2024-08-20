import { Navbar } from "./api/components/navbar";
import Head from "next/head";
import Hero from "./api/components/hero";
import Pricing from "./api/components/pricing";
import FeaturesGrid from "./api/components/features";
import AboutFooter from "./api/components/footer";

export default function App() {
  return (
    <>
      <Head>
        <title>Rorro</title>
        <meta name="description" content="Round robin tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <Pricing />
      <AboutFooter />
    </>
  );
}
