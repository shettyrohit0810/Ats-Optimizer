"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // Hide navbar on resume-checker page since it has its own header
  if (pathname === '/resume-checker') {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;
