"use client";

import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Target, BarChart3 } from 'lucide-react';

const LeftSidebar = ({ analysisData }: { analysisData: any }) => {
  // Handle both job description comparison and basic resume analysis
  const score = analysisData?.ats_match_analysis?.overall_score || analysisData?.resume_score?.score?.total || 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // For job description comparison
  const breakdown = analysisData?.scoring_breakdown || analysisData?.resume_score?.breakdown || {};
  const industry = analysisData?.company_info?.industry || analysisData?.resume_score?.industry || {};
  const skills = analysisData?.detailed_analysis?.technical_skills_analysis || analysisData?.skills || {};
  
  // Handle both data structures
  const softSkillsCount = analysisData?.detailed_analysis?.soft_skills_analysis?.matched_skills?.length || 
                         analysisData?.keyword_analysis?.keyword_stats?.soft_skills_count || 0;
  
  let technicalSkillsCount = 0;
  if (analysisData?.detailed_analysis?.technical_skills_analysis) {
    // Job description comparison data
    const techAnalysis = analysisData.detailed_analysis.technical_skills_analysis;
    technicalSkillsCount = (techAnalysis.exact_matches?.length || 0) + (techAnalysis.partial_matches?.length || 0);
  } else if (skills.technical && typeof skills.technical === 'object' && skills.technical !== null) {
    // Basic resume analysis data
    technicalSkillsCount = Object.values(skills.technical).reduce((sum: number, arr: any) => {
        return sum + (Array.isArray(arr) ? arr.length : 0);
    }, 0);
  }
  
  const thresholds = {
    technical_skills: 5,      // Technical skills threshold
    soft_skills: 3,           // Soft skills threshold
    experience_match: 3,       // Experience match threshold
    education_fit: 2,          // Education fit threshold
    project_relevance: 2,      // Project relevance threshold
    keyword_coverage: 2,       // Keyword coverage threshold
    formatting_compliance: 1,  // Formatting compliance threshold
  };

  // Create checks based on job description comparison data
  const allChecks = [
    { 
      name: 'Technical Skills', 
      value: Math.min(breakdown.technical_skills?.score || 0, breakdown.technical_skills?.max_points || 0), 
      actualValue: breakdown.technical_skills?.score || 0,
      threshold: breakdown.technical_skills?.max_points || 0
    },
    { 
      name: 'Soft Skills', 
      value: Math.min(breakdown.soft_skills?.score || 0, breakdown.soft_skills?.max_points || 0), 
      actualValue: breakdown.soft_skills?.score || 0,
      threshold: breakdown.soft_skills?.max_points || 0
    },
    { 
      name: 'Experience Match', 
      value: Math.min(breakdown.experience_match?.score || 0, breakdown.experience_match?.max_points || 0), 
      actualValue: breakdown.experience_match?.score || 0,
      threshold: breakdown.experience_match?.max_points || 0
    },
    { 
      name: 'Education Fit', 
      value: Math.min(breakdown.education_fit?.score || 0, breakdown.education_fit?.max_points || 0), 
      actualValue: breakdown.education_fit?.score || 0,
      threshold: breakdown.education_fit?.max_points || 0
    },
    { 
      name: 'Project Relevance', 
      value: Math.min(breakdown.project_relevance?.score || 0, breakdown.project_relevance?.max_points || 0), 
      actualValue: breakdown.project_relevance?.score || 0,
      threshold: breakdown.project_relevance?.max_points || 0
    },
    { 
      name: 'Keyword Coverage', 
      value: Math.min(breakdown.keyword_coverage?.score || 0, breakdown.keyword_coverage?.max_points || 0), 
      actualValue: breakdown.keyword_coverage?.score || 0,
      threshold: breakdown.keyword_coverage?.max_points || 0
    },
    { 
      name: 'Formatting', 
      value: Math.min(breakdown.formatting_compliance?.score || 0, breakdown.formatting_compliance?.max_points || 0), 
      actualValue: breakdown.formatting_compliance?.score || 0,
      threshold: breakdown.formatting_compliance?.max_points || 0
    },
  ];

  const topFixes = allChecks.filter(check => check.actualValue < check.threshold);
  const completed = allChecks.filter(check => check.actualValue >= check.threshold);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';  // Reduced from 80 to 70
    if (score >= 50) return 'text-yellow-500'; // Reduced from 60 to 50
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return 'from-green-400 to-green-600';  // Reduced from 80 to 70
    if (score >= 50) return 'from-yellow-400 to-orange-500'; // Reduced from 60 to 50
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full">
      {/* Simple Header */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Resume Score</h2>
        <p className="text-xs text-gray-500">ATS Compatibility</p>
      </div>

      {/* Compact Score Display */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle 
              className="text-gray-200" 
              strokeWidth="6" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
            />
            <circle 
              strokeWidth="6" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * score / 100)} 
              strokeLinecap="round" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50"
              style={{
                stroke: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
              }}
            />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${
              score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {Math.round(score)}
            </span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          score >= 70 ? 'bg-green-100 text-green-700' : 
          score >= 50 ? 'bg-yellow-100 text-yellow-700' : 
          'bg-red-100 text-red-700'
        }`}>
          {score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work'}
        </div>
      </div>
      
      {/* Industry */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-blue-700">Industry</span>
          <span className="text-sm font-bold text-blue-900 capitalize">{industry.detected || 'Technology'}</span>
        </div>
      </div>

      {/* Detailed Scoring */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-xs font-semibold text-gray-700 mb-3">Detailed Scoring</h3>
        <div className="space-y-3">
          {/* Keyword Match */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Keyword Match</span>
              <span className="text-xs font-bold text-gray-900">47.5/55</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: '86.4%' }}
              ></div>
            </div>
          </div>

          {/* Formatting */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Formatting</span>
              <span className="text-xs font-bold text-gray-900">11.5/15</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: '76.7%' }}
              ></div>
            </div>
          </div>

          {/* Experience Alignment */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Experience Alignment</span>
              <span className="text-xs font-bold text-gray-900">12.0/12</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Impact Metrics</span>
              <span className="text-xs font-bold text-gray-900">8.0/8</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Education</span>
              <span className="text-xs font-bold text-gray-900">8.0/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: '80%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="space-y-3">
        {/* Areas to Improve */}
        {topFixes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-red-600 mb-2 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Needs Attention
            </h3>
            <div className="space-y-2">
              {topFixes.slice(0, 2).map((fix, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded text-xs">
                  <span className="text-gray-700">{fix.name}</span>
                  <span className="font-bold text-red-600">
                    {Math.round(fix.actualValue)} (need {fix.threshold})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LeftSidebar; 