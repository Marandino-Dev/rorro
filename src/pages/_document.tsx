import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className='dark' lang='en'>
      <Head />
      <body className='bg-light-bg text-dark dark:text-dark dark:bg-dark-bg'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
