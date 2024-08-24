import Footer from '../api/components/footer';
import Navbar from '../api/components/navbar';
import React, { type JSX } from 'react';



type Props = {
  children: (string | JSX.Element)[];
}


export default function Layout({ children }: Props) {
  return (
    <>
      <Navbar />
      <main className='bg-light-bg text-dark dark:text-dark dark:bg-dark-bg'>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-screen-xl">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
