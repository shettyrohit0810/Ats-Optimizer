"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import LeftSidebar from '@/components/LeftSidebar';
import MainContent from '@/components/MainContent';

function ScanResultsContent() {
  const searchParams = useSearchParams();
  const [scanData, setScanData] = useState<any>(null);
  const [resumeJson, setResumeJson] = useState<any>(null);
  const [jobDescriptionJson, setJobDescriptionJson] = useState<any>(null);
  const [comparisonJson, setComparisonJson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get scan results from URL params or sessionStorage
    const resultsParam = searchParams.get('results');
    const resumeParam = searchParams.get('resume');
    const jobParam = searchParams.get('job');
    const comparisonParam = searchParams.get('comparison');
    
    if (resultsParam && resumeParam && jobParam && comparisonParam) {
      try {
        const decodedResults = JSON.parse(decodeURIComponent(resultsParam));
        const decodedResume = JSON.parse(decodeURIComponent(resumeParam));
        const decodedJob = JSON.parse(decodeURIComponent(jobParam));
        const decodedComparison = JSON.parse(decodeURIComponent(comparisonParam));
        setScanData(decodedResults);
        setResumeJson(decodedResume);
        setJobDescriptionJson(decodedJob);
        setComparisonJson(decodedComparison);
      } catch (error) {
        console.error('Error parsing URL params:', error);
        // Fallback to sessionStorage
        const storedResults = sessionStorage.getItem('scanResults');
        const storedResume = sessionStorage.getItem('resumeJson');
        const storedJob = sessionStorage.getItem('jobDescriptionJson');
        const storedComparison = sessionStorage.getItem('comparisonJson');
        if (storedResults && storedResume && storedJob && storedComparison) {
          setScanData(JSON.parse(storedResults));
          setResumeJson(JSON.parse(storedResume));
          setJobDescriptionJson(JSON.parse(storedJob));
          setComparisonJson(JSON.parse(storedComparison));
        }
      }
    } else {
      // Try sessionStorage
      const storedResults = sessionStorage.getItem('scanResults');
      const storedResume = sessionStorage.getItem('resumeJson');
      const storedJob = sessionStorage.getItem('jobDescriptionJson');
      const storedComparison = sessionStorage.getItem('comparisonJson');
      if (storedResults && storedResume && storedJob && storedComparison) {
        setScanData(JSON.parse(storedResults));
        setResumeJson(JSON.parse(storedResume));
        setJobDescriptionJson(JSON.parse(storedJob));
        setComparisonJson(JSON.parse(storedComparison));
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (!comparisonJson || !scanData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Scan Results Found</h2>
            <p className="text-gray-600">Please go back and run a new scan.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resume Analysis</h1>
              <p className="text-sm text-gray-500">Your personalized recommendations</p>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar - Score Card */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
              <LeftSidebar analysisData={comparisonJson} />
            </div>
          </div>

          {/* Right Content - Analysis Sections */}
          <div className="flex-1">
            <MainContent analysisData={comparisonJson} editableResumeData={resumeJson} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScanResults() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scan results...</p>
        </div>
      </div>
    }>
      <ScanResultsContent />
    </Suspense>
  );
} 