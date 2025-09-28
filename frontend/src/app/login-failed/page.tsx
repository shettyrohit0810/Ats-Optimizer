"use client";

import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function LoginFailedPage() {
  const router = useRouter();

  const handleRetry = () => {
    window.location.href = API_ENDPOINTS.GOOGLE_LOGIN;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
          <p className="text-gray-600">We couldn't sign you in with Google</p>
        </div>

        {/* Error Details */}
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="font-semibold text-red-800 mb-2">What went wrong?</h3>
          <ul className="text-sm text-red-700 text-left space-y-1">
            <li>• You may have cancelled the sign-in process</li>
            <li>• There might be a temporary connection issue</li>
            <li>• Your Google account may have restrictions</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Still having trouble?</p>
          <div className="space-y-2">
            <a href="#" className="text-blue-600 hover:underline text-sm block">Contact Support</a>
            <a href="#" className="text-blue-600 hover:underline text-sm block">View Help Center</a>
          </div>
        </div>
      </div>
    </div>
  );
}
