"use client";

import React from 'react';

type KeywordBuckets = Record<string, string[]>;

interface IneffectiveKeywordItem {
  term: string;
  context?: string;
  suggestion?: string;
  suggestions?: string[];
  count?: number;
}

type IneffectiveKeywords = Record<string, IneffectiveKeywordItem[]>;

interface KeywordStats {
  ineffective_score?: number;
  ineffective_count?: number;
  total_keywords_analyzed?: number;
  technical_skills_count?: number;
  soft_skills_count?: number;
  balance_feedback?: string;
}

interface KeywordAnalysis {
  skill_keywords?: KeywordBuckets;
  tool_keywords?: KeywordBuckets;
  domain_keywords?: KeywordBuckets;
  power_verbs?: string[];
  soft_skills?: string[];
  ineffective_keywords?: IneffectiveKeywords;
  keyword_stats?: KeywordStats;
}

interface KeywordAnalysisProps {
  keywordAnalysis?: KeywordAnalysis | null;
}

const KeywordAnalysisDisplay: React.FC<KeywordAnalysisProps> = ({ keywordAnalysis }) => {
  if (!keywordAnalysis) {
    return null;
  }

  const toTitle = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const renderKeywordSection = (title: string, keywords: string[], key?: string) => {
    if (keywords.length === 0) return null;
    
    return (
      <div key={key} className="mb-4">
        <h4 className="font-semibold text-gray-300 mb-2">{title}:</h4>
        <div className="bg-gray-700 rounded p-3">
          <span className="text-gray-200">{keywords.join(', ')}</span>
        </div>
      </div>
    );
  };

  const renderKeywordCategory = (title: string, categoryData?: KeywordBuckets) => {
    if (!categoryData) return null;
    const hasContent = Object.values(categoryData).some(arr => Array.isArray(arr) && arr.length > 0);
    if (!hasContent) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">{title}</h3>
        {Object.entries(categoryData).map(([key, value]) => (
          renderKeywordSection(toTitle(key), value, key)
        ))}
      </div>
    );
  };

  const stats = keywordAnalysis.keyword_stats ?? {};
  const score = stats.ineffective_score ?? 0;
  const ineffectiveCount = stats.ineffective_count ?? 0;
  const totalAnalyzed = stats.total_keywords_analyzed ?? 0;
  const technicalCount = stats.technical_skills_count ?? 0;
  const softCount = stats.soft_skills_count ?? 0;
  const balanceFeedback = stats.balance_feedback ?? '';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/20 border-green-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    if (score >= 40) return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    return 'text-red-400 bg-red-900/20 border-red-500/30';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">🔑 Keyword Analysis</h2>

      {/* Technical Skills */}
      {renderKeywordCategory('Technical Skills', keywordAnalysis.skill_keywords)}

      {/* Tools & Technologies */}
      {renderKeywordCategory('Tools & Technologies', keywordAnalysis.tool_keywords)}

      {/* Domain Expertise */}
      {renderKeywordCategory('Domain Expertise', keywordAnalysis.domain_keywords)}

      {/* Power Verbs */}
      {keywordAnalysis.power_verbs?.length ? (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Strong Action Verbs Used</h3>
          <div className="bg-gray-700 rounded p-3">
            <span className="text-gray-200">{keywordAnalysis.power_verbs.join(', ')}</span>
          </div>
        </div>
      ) : null}

      {/* Soft Skills */}
      {keywordAnalysis.soft_skills?.length ? (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Soft Skills</h3>
          <div className="bg-gray-700 rounded p-3">
            <span className="text-gray-200">{keywordAnalysis.soft_skills.join(', ')}</span>
          </div>
        </div>
      ) : null}

      {/* Ineffective Keywords */}
      {keywordAnalysis.ineffective_keywords && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Keywords to Improve</h3>
          
          {Object.entries(keywordAnalysis.ineffective_keywords).map(([category, items]) => {
            if (!items || items.length === 0) return null;
            
            return (
              <div key={category} className="mb-4">
                <h4 className="font-semibold text-red-300 mb-2">
                  {toTitle(category)}:
                </h4>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="bg-red-900/20 border border-red-500/30 rounded p-3">
                      <div className="font-medium text-red-300">Found: "{item.term}"</div>
                      {item.context && (
                        <div className="text-sm text-gray-300 mt-1">Context: {item.context}</div>
                      )}
                      {item.suggestion && (
                        <div className="text-sm text-green-300 mt-1">Suggestion: {item.suggestion}</div>
                      )}
                      {item.suggestions && (
                        <div className="text-sm text-green-300 mt-1">
                          Alternative verbs: {item.suggestions.join(', ')}
                        </div>
                      )}
                      {typeof item.count === 'number' && (
                        <div className="text-sm text-yellow-300 mt-1">Used {item.count} times</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Keyword Quality Score */}
      <div className="border-t border-gray-600 pt-6">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">📊 Keyword Quality Score</h3>
        
        <div className={`border rounded-lg p-4 mb-4 ${getScoreColor(score)}`}>
          <div className="text-3xl font-bold mb-2">
            Score: {score}/100 - {getScoreStatus(score)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 rounded p-4">
            <div className="text-lg font-semibold text-gray-300">Ineffective Keywords Found</div>
            <div className="text-2xl font-bold text-red-400">{ineffectiveCount}</div>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-lg font-semibold text-gray-300">Total Keywords Analyzed</div>
            <div className="text-2xl font-bold text-blue-400">{totalAnalyzed}</div>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-lg font-semibold text-gray-300">Technical Skills Found</div>
            <div className="text-2xl font-bold text-green-400">{technicalCount}</div>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-lg font-semibold text-gray-300">Soft Skills Found</div>
            <div className="text-2xl font-bold text-purple-400">{softCount}</div>
          </div>
        </div>

        {/* Balance Feedback */}
        {balanceFeedback && (
          <div className={`border rounded-lg p-4 ${
            balanceFeedback.includes('Less') ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30'
          }`}>
            <div className={`font-semibold ${
              balanceFeedback.includes('Less') ? 'text-red-400' : 'text-green-400'
            }`}>
              {balanceFeedback.includes('Less') ? '⚠️' : '✅'} {balanceFeedback}
            </div>
          </div>
        )}

        {/* Scoring Guide */}
        <div className="mt-4 text-sm text-gray-400">
          <div className="font-semibold mb-2">Scoring Guide:</div>
          <div>• 90-100: Exceptional keyword usage</div>
          <div>• 80-89: Strong keyword selection</div>
          <div>• 60-79: Good with room for improvement</div>
          <div>• 40-59: Needs significant improvement</div>
          <div>• 0-39: Poor keyword usage</div>
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalysisDisplay; 