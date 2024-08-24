import Link from 'next/link';
import React, { useState } from 'react';


function buttons() {
  return (
    <>
      <Link href="/#features">
        <button className="btn">Features</button>
      </Link>
      <Link href="/#pricing">
        <button className="btn">Pricing</button>
      </Link>
      <Link href="/#faq">
        <button className="btn">FAQ</button>
      </Link>
      <Link href="/dashboard">
        <button className="btn">Dashboard</button>
      </Link>
    </>

  );

}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-light-bg dark:bg-dark-bg z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className='flex items-center space-x-2 text-xl font-bold btn flex-shrink-0'>
            <img className='h-10' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8YjHt4SPnWQ0zR4IKTa9jQknRHtrvsCOoUg&s" />
            <h1>RORRO</h1>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {buttons()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={'inline-flex items-center justify-center p-2 rounded-md'}
            >
              <span className="sr-only">Menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className=" px-2 pt-2 pb-3 space-y-1 sm:px-3 [&>*]:block">
            {buttons()}
          </div>
        </div>
      )}
    </nav>
  );
}

