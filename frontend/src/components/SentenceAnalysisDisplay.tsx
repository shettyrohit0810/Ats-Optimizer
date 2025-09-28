"use client";

import React from 'react';

interface SentenceAnalysisProps {
  sentenceAnalyses: any[];
}

const SentenceAnalysisDisplay: React.FC<SentenceAnalysisProps> = ({ sentenceAnalyses }) => {
  if (!sentenceAnalyses || sentenceAnalyses.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">📝 Sentence Analysis</h2>
      
      <div className="space-y-6">
        {sentenceAnalyses.map((analysis, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
            {/* Sentence */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Sentence {index + 1}:</h3>
              <p className="text-gray-200 italic">"{analysis.sentence}"</p>
            </div>

            {/* Score */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Score:</span>
                <span className={`text-2xl font-bold ${
                  analysis.total_score >= 40 ? 'text-green-400' : 
                  analysis.total_score >= 30 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {analysis.total_score}/50
                </span>
              </div>
            </div>

            {/* Component Breakdown */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3">Component Breakdown:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(analysis.components).map(([key, component]: [string, any]) => (
                  <div key={key} className="bg-gray-700 rounded p-3">
                    <div className="text-sm font-medium text-gray-300 mb-1">
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className={`text-lg font-bold ${
                      component.score >= 8 ? 'text-green-400' : 
                      component.score >= 5 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {component.score}/10
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {component.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Section */}
            {analysis.total_score <= 45 && (
              <div className="border-t border-gray-600 pt-4">
                {analysis.mistakes && analysis.mistakes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-400 mb-2">⚠️ Issues Found:</h4>
                    <div className="space-y-2">
                      {analysis.mistakes.map((mistake: any, i: number) => (
                        <div key={i} className="bg-red-900/20 border border-red-500/30 rounded p-3">
                          <div className="font-medium text-red-300">{mistake.type}</div>
                          <div className="text-sm text-gray-300">{mistake.description}</div>
                          {mistake.example && (
                            <div className="text-sm text-gray-400 italic mt-1">{mistake.example}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.improvement_suggestion && (
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">✨ Suggested Improvement:</h4>
                    <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
                      <p className="text-green-200">"{analysis.improvement_suggestion}"</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {analysis.total_score > 45 && (
              <div className="border-t border-gray-600 pt-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded p-3 text-center">
                  <span className="text-green-400 font-semibold">✅ Excellent sentence! No improvements needed.</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentenceAnalysisDisplay; 