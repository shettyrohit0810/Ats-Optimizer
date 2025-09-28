"use client";

import React from 'react';

interface ResumeJobComparisonProps {
  comparisonData: any;
}

const ResumeJobComparisonDisplay: React.FC<ResumeJobComparisonProps> = ({ comparisonData }) => {
  if (!comparisonData) {
    return null;
  }

  const getScoreColor = (score: number, maxPoints: number) => {
    const percentage = (score / maxPoints) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-900/20 border-green-500/30';
    if (score >= 80) return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    if (score >= 70) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    if (score >= 60) return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    return 'text-red-400 bg-red-900/20 border-red-500/30';
  };

  const atsMatch = comparisonData.ats_match_analysis || {};
  const scoringBreakdown = comparisonData.scoring_breakdown || {};
  const detailedAnalysis = comparisonData.detailed_analysis || {};
  const missingRequirements = comparisonData.missing_requirements || {};
  const recommendations = comparisonData.actionable_recommendations || {};
  const strengths = comparisonData.candidate_strengths || [];
  const redFlags = comparisonData.potential_red_flags || [];
  const atsCompatibility = comparisonData.ats_compatibility || {};
  const interviewReadiness = comparisonData.interview_readiness || {};

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">🔍 Resume-Job Match Analysis</h2>

      {/* Overall ATS Match */}
      <div className={`border rounded-lg p-6 mb-6 ${getOverallScoreColor(atsMatch.overall_score || 0)}`}>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {atsMatch.overall_score || 0}/100
          </div>
          <div className="text-xl font-semibold mb-2">
            {atsMatch.grade || 'No Grade'}
          </div>
          <div className="text-lg">
            Match: {atsMatch.match_percentage || 0}%
          </div>
          {atsMatch.recommendation && (
            <div className="mt-3 text-sm bg-gray-800 rounded p-3">
              {atsMatch.recommendation}
            </div>
          )}
        </div>
      </div>

      {/* Scoring Breakdown */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">📊 Category Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(scoringBreakdown).map(([category, data]: [string, any]) => (
            <div key={category} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-300">
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <span className="text-sm text-gray-400">{data.weight}</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(data.score || 0, data.max_points || 100)}`}>
                {data.score || 0}/{data.max_points || 100}
              </div>
              {data.analysis && (
                <div className="text-sm text-gray-400 mt-2">{data.analysis}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills Analysis */}
      {detailedAnalysis.technical_skills_analysis && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">⚙️ Technical Skills Match</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">✅ Exact Matches:</h4>
                <div className="bg-green-900/20 rounded p-3 text-sm">
                  {detailedAnalysis.technical_skills_analysis.exact_matches?.join(', ') || 'None'}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">🟡 Partial Matches:</h4>
                <div className="bg-yellow-900/20 rounded p-3 text-sm">
                  {detailedAnalysis.technical_skills_analysis.partial_matches?.join(', ') || 'None'}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">❌ Missing Required:</h4>
                <div className="bg-red-900/20 rounded p-3 text-sm">
                  {detailedAnalysis.technical_skills_analysis.missing_required?.join(', ') || 'None'}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">🔶 Missing Preferred:</h4>
                <div className="bg-orange-900/20 rounded p-3 text-sm">
                  {detailedAnalysis.technical_skills_analysis.missing_preferred?.join(', ') || 'None'}
                </div>
              </div>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold">Coverage: </span>
              <span className={`text-xl font-bold ${getScoreColor(detailedAnalysis.technical_skills_analysis.coverage_percentage || 0, 100)}`}>
                {detailedAnalysis.technical_skills_analysis.coverage_percentage || 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Missing Requirements */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Missing Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(missingRequirements).map(([category, items]: [string, any]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={category} className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-red-300 mb-2">
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </h4>
                <div className="text-sm text-gray-300">
                  {Array.isArray(items) ? items.join(', ') : items}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-green-400 mb-4">💡 Actionable Recommendations</h3>
        <div className="space-y-4">
          {recommendations.high_priority && recommendations.high_priority.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-red-300 mb-2">🔥 High Priority:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recommendations.high_priority.map((item: string, index: number) => (
                  <li key={index} className="text-gray-300">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {recommendations.medium_priority && recommendations.medium_priority.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">🟡 Medium Priority:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recommendations.medium_priority.map((item: string, index: number) => (
                  <li key={index} className="text-gray-300">{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {recommendations.low_priority && recommendations.low_priority.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">🔵 Low Priority:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recommendations.low_priority.map((item: string, index: number) => (
                  <li key={index} className="text-gray-300">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.resume_optimization_tips && recommendations.resume_optimization_tips.length > 0 && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-2">📝 Resume Optimization:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recommendations.resume_optimization_tips.map((item: string, index: number) => (
                  <li key={index} className="text-gray-300">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Strengths & Red Flags */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-3">💪 Candidate Strengths:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {strengths.map((strength: string, index: number) => (
                  <li key={index} className="text-gray-300">{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Red Flags */}
          {redFlags.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-red-300 mb-3">🚨 Potential Red Flags:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {redFlags.map((flag: string, index: number) => (
                  <li key={index} className="text-gray-300">{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ATS Compatibility & Interview Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATS Compatibility */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-200 mb-3">🤖 ATS Compatibility</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Parseability Score:</span>
              <span className={getScoreColor(atsCompatibility.parseability_score || 0, 100)}>
                {atsCompatibility.parseability_score || 0}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span>Keyword Density:</span>
              <span className={getScoreColor(atsCompatibility.keyword_density || 0, 100)}>
                {atsCompatibility.keyword_density || 0}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span>Section Completeness:</span>
              <span className={getScoreColor(atsCompatibility.section_completeness || 0, 100)}>
                {atsCompatibility.section_completeness || 0}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span>Format Compliance:</span>
              <span className="text-gray-300">{atsCompatibility.format_compliance || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Interview Readiness */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-200 mb-3">🎯 Interview Readiness</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Technical Interview:</span>
              <span className={getScoreColor(interviewReadiness.technical_interview_score || 0, 100)}>
                {interviewReadiness.technical_interview_score || 0}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span>Behavioral Interview:</span>
              <span className={getScoreColor(interviewReadiness.behavioral_interview_score || 0, 100)}>
                {interviewReadiness.behavioral_interview_score || 0}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span>Domain Knowledge:</span>
              <span className={getScoreColor(interviewReadiness.domain_knowledge_score || 0, 100)}>
                {interviewReadiness.domain_knowledge_score || 0}/100
              </span>
            </div>
            <div className="mt-3 text-center font-semibold">
              Overall: {interviewReadiness.overall_readiness || 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeJobComparisonDisplay; 