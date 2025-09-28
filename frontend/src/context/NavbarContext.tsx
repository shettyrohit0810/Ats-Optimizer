"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface NavbarContextType {
  navbarContent: ReactNode | null;
  setNavbarContent: (content: ReactNode | null) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [navbarContent, setNavbarContent] = useState<ReactNode | null>(null);

  return (
    <NavbarContext.Provider value={{ navbarContent, setNavbarContent }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
}; 