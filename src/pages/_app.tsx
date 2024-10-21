import '@/styles/globals.css';
import { type AppProps } from 'next/app';
import Layout from './components/layout';
import LocalFont from 'next/font/local';

const font = LocalFont({
  src: [
    {
      path: '../../public/fonts/Eina01-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Eina01-Bold.ttf',
      weight: '700',
      style: 'bold',
    },
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  return (

    <main className={font.className}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </main>
  );
}
