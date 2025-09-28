"use client";

import NewScanSection from "@/components/NewScanSection";
import { ArrowRight, CheckCircle, Zap, Target, Users } from "lucide-react";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <div className="w-full">
        {/* Hero Section with Enhanced Gradient Background */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-center py-20 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
            <div className="absolute top-40 left-1/2 w-60 h-60 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Resume Optimization
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              Optimize your resume to{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                get more interviews
              </span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              Our advanced ATS scanner analyzes your resume against job descriptions, 
              highlighting key skills and experience that recruiters need to see. 
              Get detailed feedback and boost your interview chances.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/login" 
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
              >
                Scan Your Resume For Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="text-gray-600 hover:text-gray-800 font-medium py-4 px-8 rounded-xl text-lg transition-colors duration-300 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                View Sample Results
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Instant Results
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Secure & Private
              </div>
            </div>
          </div>
          
          {/* Enhanced Wave SVG */}
          <div className="absolute bottom-0 left-0 w-full h-32" style={{transform: 'translateY(1px)'}}>
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
              <path d="M0 63.628C240 16.543 480 16.543 720 63.628C960 110.713 1200 110.713 1440 63.628V120H0V63.628Z" fill="white"/>
            </svg>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">500K+</div>
                <div className="text-gray-600">Resumes Optimized</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">85%</div>
                <div className="text-gray-600">More Interview Calls</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-indigo-600 mb-2">4.9/5</div>
                <div className="text-gray-600">User Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Scan Section */}
        <NewScanSection />
        
        {/* Features Section */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our ATS Optimizer?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our advanced AI technology provides comprehensive resume analysis that helps you stand out to recruiters and ATS systems.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Advanced machine learning algorithms analyze your resume just like a real ATS system would, providing accurate feedback.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Job-Specific Optimization</h3>
                <p className="text-gray-600">
                  Get tailored recommendations based on specific job descriptions to maximize your chances of getting noticed.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Insights</h3>
                <p className="text-gray-600">
                  Receive detailed feedback and actionable suggestions from our team of career experts and recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
  );
}
