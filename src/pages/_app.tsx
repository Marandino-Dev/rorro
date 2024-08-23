import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./components/layout";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <title>Rorro</title>
        <meta name="description" content="Round robin tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />;
    </Layout>
  )
}
