import Hero from './api/components/hero';
import Pricing from './api/components/pricing';
import FeaturesGrid from './api/components/features';
import Head from 'next/head';
import { useKonamiCode } from './components/hooks/useKonami';

export default function Home() {

  useKonamiCode();

  return (
    <>
      <Head>
        <title>Rorro</title>
        <meta name="description" content="A Round Robin Rotation Tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Hero />
      <FeaturesGrid />
      <Pricing />
    </>
  );
}

