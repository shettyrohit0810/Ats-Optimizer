"use client";

import Link from 'next/link';
import { useNavbar } from '@/context/NavbarContext';

const Navbar = () => {
  const { navbarContent } = useNavbar();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-[#1E40AF]">
              ATS Optimizer
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {navbarContent ? (
              navbarContent
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
                  Log In
                </Link>
                <Link href="/signup" className="bg-[#1E40AF] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 