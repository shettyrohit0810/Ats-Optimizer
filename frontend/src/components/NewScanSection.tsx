"use client";
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Star, FileText, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';

const NewScanSection = () => {
  const router = useRouter();
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      setResumeText(''); // Clear text if file is uploaded
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    }
  });

  const isScanDisabled = (!resumeText && !uploadedFile) || !jobDescriptionText;

  const handleScan = async () => {
    if (isScanDisabled) return;

    setIsScanning(true);
    setErrorMessage('');

    try {
      let requestData;
      
      if (uploadedFile) {
        // For file uploads, still use FormData
        const formData = new FormData();
        formData.append('resume', uploadedFile);
        formData.append('jobDescription', jobDescriptionText);
        
        requestData = {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        };
      } else {
        // For text input, use JSON
        requestData = {
          method: 'POST',
          body: JSON.stringify({
            resumeText,
            jobDescription: jobDescriptionText
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        };
      }

      const response = await fetch(API_ENDPOINTS.SCAN, requestData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Store data in sessionStorage for the results page
      sessionStorage.setItem('scanResults', JSON.stringify(data));
      sessionStorage.setItem('resumeJson', JSON.stringify(data.resumeJson));
      sessionStorage.setItem('jobDescriptionJson', JSON.stringify(data.jobDescriptionJson));
      sessionStorage.setItem('comparisonJson', JSON.stringify(data.comparisonJson));
      // Store the original job description text for project matching
      sessionStorage.setItem('originalJobDescription', jobDescriptionText);
      
      // Navigate to scan results page with job description as URL parameter
      const encodedJobDescription = encodeURIComponent(jobDescriptionText);
      router.push(`/scan-results?jobDescription=${encodedJobDescription}`);

    } catch (error) {
      console.error('Error scanning resume:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to scan resume');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">New Scan</h2>
            <p className="text-gray-600">Upload your resume and job description to get started</p>
          </div>
          <button className="text-sm font-medium text-gray-700 border border-gray-300 rounded-xl px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
            View a Sample Scan
          </button>
        </div>
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="font-semibold text-gray-900 text-lg">Resume</h3>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center transition-colors duration-200">
                    <Star size={16} className="mr-2" />
                    Saved Resumes
                </button>
            </div>
            <div className="p-6">
                <textarea 
                    className="w-full h-48 p-4 border-none resize-none focus:ring-0 text-gray-700 placeholder-gray-400"
                    placeholder="Paste resume text..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    disabled={!!uploadedFile}
                ></textarea>
                {uploadedFile ? (
                  <div className="mt-4 border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText size={24} className="text-green-600" />
                      <p className="ml-3 text-sm text-green-800 font-medium">{uploadedFile.name}</p>
                    </div>
                    <button 
                      onClick={() => setUploadedFile(null)} 
                      className="p-2 hover:bg-green-100 rounded-full transition-colors duration-200"
                    >
                      <X size={20} className="text-green-600" />
                    </button>
                  </div>
                ) : (
                 <div {...getRootProps()} className={`mt-4 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}`}>
                    <input {...getInputProps()} />
                    <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 font-medium">Drag & Drop or Upload</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or TXT files</p>
                </div>
                )}
            </div>
          </div>
          
          {/* Job Description Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
             <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="font-semibold text-gray-900 text-lg">Job Description</h3>
            </div>
            <div className="p-6">
                 <textarea 
                    className="w-full h-64 p-4 border-none resize-none focus:ring-0 text-gray-700 placeholder-gray-400"
                    placeholder="Copy and paste job description here"
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                Available scans: <span className="font-semibold text-blue-600">3</span>
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors duration-200">
                Upgrade
              </a>
            </div>
            <button 
                className={`group font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 transform ${
                  isScanDisabled 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : isScanning 
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
                disabled={isScanDisabled || isScanning}
                onClick={handleScan}
            >
                {isScanning ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Scanning...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Scan Resume
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default NewScanSection; 