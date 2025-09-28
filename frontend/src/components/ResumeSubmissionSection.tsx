"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ResumeEditor from './ResumeEditor';
import { extractTextFromFile } from '@/utils/fileExtractors';
import AnalysisLoader from './AnalysisLoader';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import ResumeResultsDisplay from './ResumeResultsDisplay';
import dynamic from 'next/dynamic';
import { useNavbar } from '@/context/NavbarContext';
import { API_ENDPOINTS } from '@/config/api';

const FileViewer = dynamic(() => import('./FileViewer'), { ssr: false });

const ResumeSubmissionSection = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [editableResumeData, setEditableResumeData] = useState<any>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const { setNavbarContent } = useNavbar();

  useEffect(() => {
    if (showResults && !showEditor && analysisData) {
      setNavbarContent(
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEditor(true)}
            className="border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 text-sm"
          >
            Edit Resume
          </button>
          <button 
            onClick={() => {
              setShowResults(false);
              setFile(null);
            }}
            className="bg-[#1E40AF] hover:bg-[#1D4ED8] text-white font-semibold py-2 px-4 rounded-lg text-sm"
          >
            Re-score Resume
          </button>
        </div>
      );
    } else {
      setNavbarContent(null);
    }
    
    return () => setNavbarContent(null); // Cleanup on unmount
  }, [showResults, showEditor, analysisData, setNavbarContent]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setErrorMessage(null);
        extractResumeText(droppedFile);
      }
    }
  };

  const extractResumeText = async (file: File) => {
    setIsExtracting(true);
    setErrorMessage(null);
    
    try {
      await extractTextFromFile(file);
      // Don't show editor immediately, wait for analyze button click
    } catch (error) {
      console.error('Error extracting text:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to extract text from file');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setErrorMessage(null);
        extractResumeText(selectedFile);
      }
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Only PDF and DOCX files are allowed');
      return false;
    }
    
    if (file.size > maxSize) {
      setErrorMessage('File size must be less than 2MB');
      return false;
    }
    
    return true;
  };

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setErrorMessage('Please upload a file first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setShowResults(false);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Use the /upload endpoint to send the file
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // The backend returns analysis data directly from the upload endpoint
      setAnalysisData(data.analysis);
      setEditableResumeData(data.analysis);
      setShowResults(true);

    } catch (error) {
      console.error('Error analyzing resume:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  }, [file]);

  useEffect(() => {
    if (file) {
      handleSubmit();
    }
  }, [file, handleSubmit]);

  const handleBackToResults = () => {
    setShowEditor(false);
  };

  return (
    <div className="mx-auto">
      {isAnalyzing ? (
        <AnalysisLoader />
      ) : showResults && !showEditor && analysisData ? (
        showDetailedView ? (
          <ResumeResultsDisplay 
            analysisData={analysisData} 
            onBackToSummary={() => setShowDetailedView(false)}
          />
        ) : (
          <div className="bg-gray-50 min-h-screen">
            <main className="p-8">
              {/* View Toggle */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => setShowDetailedView(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>Detailed Analysis View</span>
                </button>
              </div>
              
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-3">
                  <LeftSidebar analysisData={analysisData} />
                </div>
                <div className="col-span-12 lg:col-span-5">
                  <MainContent analysisData={analysisData} editableResumeData={editableResumeData} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                  {file && <FileViewer file={file} />}
                </div>
              </div>
            </main>
          </div>
        )
      ) : showEditor ? (
        <div className="max-w-7xl mx-auto py-12 px-4">
          <button onClick={handleBackToResults} className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded">
            &larr; Back to Results
          </button>
          <ResumeEditor
            resumeData={editableResumeData}
            onDataChange={(updatedData) => setEditableResumeData(updatedData)}
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-purple-50/30">
            {/* Compact Hero and Upload Section */}
            <div className="max-w-5xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Hero Text */}
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Optimize Your Resume in{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Seconds
                    </span>
                  </h1>
                  <p className="text-base text-gray-600 mb-4">
                    Upload your resume to get an instant, data-driven analysis of its ATS compatibility and overall effectiveness.
                  </p>
                  
                  {/* Quick Features - Compact */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-xs text-gray-600">AI-Powered Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">⚡</span>
                      </div>
                      <span className="text-xs text-gray-600">Instant Results</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🔒</span>
                      </div>
                      <span className="text-xs text-gray-600">Secure & Private</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">📊</span>
                      </div>
                      <span className="text-xs text-gray-600">Detailed Reports</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Upload Area - Compact */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
                >
                  <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400'
                  }`}>
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Image
                        src="/file.svg"
                        alt="Upload file"
                        width={24}
                        height={24}
                        className="text-white"
                      />
                    </div>
                    
                    <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">
                      {isDragging ? 'Drop your resume here' : 'Drag & Drop your resume'}
                    </h2>
                    <p className="text-gray-500 mb-4 text-center text-sm">or click to browse files</p>
                    
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.docx"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-sm"
                    >
                      Browse Files
                    </label>
                    
                    <p className="text-xs text-gray-400 mt-3 text-center">PDF or DOCX only, up to 2MB</p>
                    
                    {errorMessage && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-xs text-center">{errorMessage}</p>
                      </div>
                    )}
                    
                    {isExtracting && (
                      <div className="mt-3 flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                        <p className="text-blue-600 text-xs">Extracting text...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Compact CTA Section */}
            <div className="max-w-5xl mx-auto px-4 py-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center border border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-600 mb-4 max-w-2xl mx-auto text-sm">
                  Join thousands of job seekers who have optimized their resumes and landed more interviews with our AI-powered analysis.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>500K+ Resumes Optimized</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>85% More Interview Calls</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span>4.9/5 User Rating</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ResumeSubmissionSection; 