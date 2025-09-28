"use client";

import React, { useState, useEffect } from 'react';
import ResumeSubmissionSection from '@/components/ResumeSubmissionSection';
import { User, LogOut } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function ResumeCheckerPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    fetch(API_ENDPOINTS.ME, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'Not logged in') {
        window.location.href = '/login';
      } else {
        setUser(data);
        setIsLoading(false);
      }
    })
    .catch(() => {
      window.location.href = '/login';
    });
  }, []);

  const handleLogout = () => {
    window.location.href = API_ENDPOINTS.LOGOUT;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Consistent Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-[#1E40AF]">
                ATS Optimizer
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Simple User Info */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.givenName?.[0] || user?.displayName?.[0] || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                </div>
              </div>
              
              {/* Only Logout Button */}
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Minimal Welcome Section */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">📄</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.name?.givenName || 'there'}</span>!
                  </h2>
                  <p className="text-xs text-gray-600">Ready to optimize your resume?</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ResumeSubmissionSection />
    </main>
  );
} 