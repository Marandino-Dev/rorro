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
      <main>{children}</main>
      <Footer />
    </>
  );
}
