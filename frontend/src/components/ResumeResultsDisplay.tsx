"use client";

import React, { useState } from 'react';

interface ResumeResultsDisplayProps {
  analysisData: any;
  onBackToSummary?: () => void;
}

const ResumeResultsDisplay: React.FC<ResumeResultsDisplayProps> = ({ analysisData, onBackToSummary }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'contact', label: 'Contact', icon: '👤' },
    { id: 'skills', label: 'Skills', icon: '🛠️' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'analysis', label: 'Analysis', icon: '🔍' },
    { id: 'score', label: 'ATS Score', icon: '📈' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Resume Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{analysisData?.experience?.length || 0}</div>
            <div className="text-sm text-gray-600">Experience</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{analysisData?.projects?.length || 0}</div>
            <div className="text-sm text-gray-600">Projects</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{analysisData?.education?.length || 0}</div>
            <div className="text-sm text-gray-600">Education</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {analysisData?.keyword_analysis?.keyword_stats?.technical_skills_count || 0}
            </div>
            <div className="text-sm text-gray-600">Tech Skills</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-teal-600">
              {analysisData?.keyword_analysis?.keyword_stats?.soft_skills_count || 0}
            </div>
            <div className="text-sm text-gray-600">Soft Skills</div>
          </div>
        </div>
      </div>

      {analysisData?.professional_summary && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Professional Summary</h4>
          <p className="text-gray-600 leading-relaxed">{analysisData.professional_summary}</p>
        </div>
      )}
    </div>
  );

  const renderContactInfo = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(analysisData?.contact_info || {}).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
              {key === 'name' && '👤'}
              {key === 'email' && '📧'}
              {key === 'phone' && '📱'}
              {key === 'location' && '📍'}
              {key === 'linkedin' && '💼'}
              {key === 'github' && '🔗'}
              {key === 'personal_website' && '🌐'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 capitalize">
                {key.replace('_', ' ')}
              </div>
              <div className="text-gray-800">{String(value) || 'Not provided'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      {/* Technical Skills */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Technical Skills</h3>
        {Object.entries(analysisData?.skills?.technical || {}).map(([category, skills]) => (
          <div key={category} className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2 capitalize">
              {category.replace(/_/g, ' ')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {(skills as string[]).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Soft Skills */}
      {analysisData?.skills?.soft?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Soft Skills</h3>
          <div className="flex flex-wrap gap-2">
            {analysisData.skills.soft.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {analysisData?.certifications?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Certifications</h3>
          <div className="space-y-3">
            {analysisData.certifications.map((cert: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800">{cert.name}</h4>
                {cert.issuer && <p className="text-gray-600">Issued by: {cert.issuer}</p>}
                {cert.date && <p className="text-gray-500 text-sm">{cert.date}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {analysisData?.languages?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {analysisData.languages.map((language: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      {analysisData?.experience?.length > 0 ? (
        analysisData.experience.map((exp: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{exp.title}</h3>
                <p className="text-blue-600 font-medium">{exp.company}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{exp.location}</p>
                <p>{exp.dates}</p>
              </div>
            </div>
            {exp.highlights?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Key Achievements</h4>
                <ul className="space-y-1">
                  {exp.highlights.map((highlight: string, hIndex: number) => (
                    <li key={hIndex} className="text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 text-6xl mb-4">💼</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Work Experience Found</h3>
          <p className="text-gray-500">Consider adding your work experience to strengthen your resume.</p>
        </div>
      )}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      {analysisData?.education?.length > 0 ? (
        analysisData.education.map((edu: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                <p className="text-blue-600 font-medium">{edu.school}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{edu.location}</p>
                <p>{edu.graduation_date}</p>
                {edu.gpa && <p>GPA: {edu.gpa}</p>}
              </div>
            </div>
            {edu.relevant_courses?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Relevant Courses</h4>
                <div className="flex flex-wrap gap-2">
                  {edu.relevant_courses.map((course: string, cIndex: number) => (
                    <span
                      key={cIndex}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Education Information Found</h3>
          <p className="text-gray-500">Consider adding your educational background to your resume.</p>
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      {analysisData?.projects?.length > 0 ? (
        analysisData.projects.map((project: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Project →
                  </a>
                )}
              </div>
              <div className="text-right text-sm text-gray-500">
                {project.duration && <p>{project.duration}</p>}
                {project.start_date && project.end_date && (
                  <p>{project.start_date} - {project.end_date}</p>
                )}
              </div>
            </div>
            
            {project.description && (
              <p className="text-gray-600 mb-3">{project.description}</p>
            )}
            
            {project.technologies?.length > 0 && (
              <div className="mb-3">
                <h4 className="font-semibold text-gray-700 mb-2">Technologies Used</h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string, tIndex: number) => (
                    <span
                      key={tIndex}
                      className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {project.highlights?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Key Features</h4>
                <ul className="space-y-1">
                  {project.highlights.map((highlight: string, hIndex: number) => (
                    <li key={hIndex} className="text-gray-600 flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 text-6xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Projects Found</h3>
          <p className="text-gray-500">Consider adding personal or professional projects to showcase your skills.</p>
        </div>
      )}
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* Keyword Analysis */}
      {analysisData?.keyword_analysis && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Keyword Analysis</h3>
          
          {/* Keyword Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analysisData.keyword_analysis.keyword_stats?.ineffective_score || 0}
              </div>
              <div className="text-sm text-gray-600">Effectiveness Score</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {analysisData.keyword_analysis.keyword_stats?.ineffective_count || 0}
              </div>
              <div className="text-sm text-gray-600">Issues Found</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analysisData.keyword_analysis.keyword_stats?.technical_skills_count || 0}
              </div>
              <div className="text-sm text-gray-600">Tech Skills</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analysisData?.keyword_analysis?.keyword_stats?.soft_skills_count || 0}
              </div>
              <div className="text-sm text-gray-600">Soft Skills</div>
            </div>
          </div>

          {/* Detected Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Detected Soft Skills */}
            {analysisData.keyword_analysis.soft_skills?.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">✅ Detected Soft Skills ({analysisData.keyword_analysis.soft_skills.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.keyword_analysis.soft_skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Power Verbs */}
            {analysisData.keyword_analysis.power_verbs?.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">💪 Power Verbs ({analysisData.keyword_analysis.power_verbs.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.keyword_analysis.power_verbs.map((verb: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {verb}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Balance Feedback */}
          {analysisData.keyword_analysis.keyword_stats?.balance_feedback && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">📊 Skills Balance</h4>
              <p className="text-yellow-700">{analysisData.keyword_analysis.keyword_stats.balance_feedback}</p>
            </div>
          )}

          {/* Ineffective Keywords */}
          {analysisData.keyword_analysis.ineffective_keywords && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Areas for Improvement</h4>
              {Object.entries(analysisData.keyword_analysis.ineffective_keywords).map(([category, items]: [string, any]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                return (
                  <div key={category} className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2 capitalize">
                      {category.replace(/_/g, ' ')}
                    </h5>
                    <div className="space-y-2">
                      {items.map((item: any, index: number) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-red-800">{item.term}</span>
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          </div>
                          {item.context && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Context:</strong> {item.context}
                            </p>
                          )}
                          {item.suggestion && (
                            <p className="text-sm text-green-700 mt-1">
                              💡 <strong>Suggestion:</strong> {item.suggestion}
                            </p>
                          )}
                          {item.suggestions && Array.isArray(item.suggestions) && (
                            <div className="text-sm text-green-700 mt-1">
                              💡 <strong>Alternatives:</strong> {item.suggestions.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sentence Analysis */}
      {analysisData?.sentence_analysis?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Sentence Analysis</h3>
          <div className="space-y-4">
            {analysisData.sentence_analysis.map((analysis: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <blockquote className="text-gray-700 italic flex-1 mr-4 border-l-4 border-gray-300 pl-4">
                    "{analysis.sentence}"
                  </blockquote>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.total_score}/50
                    </div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                </div>
                
                {/* Component Breakdown */}
                {analysis.components && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                    {Object.entries(analysis.components).map(([component, data]: [string, any]) => (
                      <div key={component} className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm font-bold text-gray-700">{data.score}/10</div>
                        <div className="text-xs text-gray-500 capitalize">{component.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mistakes */}
                {analysis.mistakes?.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-red-800 mb-2">Issues Identified:</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.mistakes.map((mistake: any, mIndex: number) => (
                        <span key={mIndex} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {mistake.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.improvement_suggestion && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <p className="text-sm font-medium text-green-800 mb-1">💡 Improvement Suggestion:</p>
                    <p className="text-sm text-green-700">{analysis.improvement_suggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderScore = () => (
    <div className="space-y-6">
      {analysisData?.resume_score ? (
        <>
          {/* Main Score Display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">ATS Compatibility Score</h3>
            
            <div className="text-center mb-8">
              <div className="text-8xl font-bold text-blue-600 mb-4">
                {analysisData.resume_score.score?.total || 0}
              </div>
              <div className="text-2xl text-gray-600 mb-2">out of 100</div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {analysisData.resume_score.score?.grade || 'N/A'}
              </div>
              {analysisData.resume_score.score?.percentile && (
                <div className="text-lg text-gray-600">
                  {analysisData.resume_score.score.percentile}
                </div>
              )}
            </div>

            {/* Status and Recommendation */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">📊 ATS Status</h4>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {analysisData.resume_score.status?.ats_compatibility || 'N/A'}
              </p>
              <p className="text-gray-600">
                {analysisData.resume_score.status?.recommendation || 'No recommendation available'}
              </p>
            </div>

            {/* Industry Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">🏢 Industry Analysis</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Detected Industry:</strong> 
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {analysisData.resume_score.industry?.detected || 'Unknown'}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Confidence:</strong> 
                    <span className="ml-2 capitalize">{analysisData.resume_score.industry?.confidence || 'Low'}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">⚖️ Scoring Methodology</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Focus:</strong> {analysisData.resume_score.methodology?.focus || 'General'}</p>
                  {analysisData.resume_score.methodology?.weights && (
                    <div className="mt-2">
                      <strong>Weights:</strong>
                      <ul className="mt-1 space-y-1">
                        {Object.entries(analysisData.resume_score.methodology.weights).map(([key, value]) => (
                          <li key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span>{String(value)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(analysisData.resume_score.breakdown || {}).map(([category, score]: [string, any]) => {
                // const percentage = typeof score === 'number' ? Math.round((score / 100) * 100) : 0;
                const maxScore = category === 'keyword_match_score' ? 55 : 
                               category === 'formatting_score' ? 15 :
                               category === 'experience_alignment_score' ? 12 :
                               category === 'impact_metrics_score' ? 8 :
                               category === 'education_score' ? 10 : 100;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 capitalize">
                        {category.replace(/_/g, ' ').replace('score', '')}
                      </span>
                      <span className="font-bold text-gray-800">
                        {typeof score === 'number' ? score.toFixed(1) : score}/{maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((typeof score === 'number' ? score : 0) / maxScore * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Insights */}
          {analysisData.resume_score.insights?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Key Insights</h3>
              <div className="space-y-3">
                {analysisData.resume_score.insights.map((insight: string, index: number) => {
                  const isPositive = insight.includes('STRONG') || insight.includes('GOOD');
                  const isCritical = insight.includes('CRITICAL');
                  const isModerate = insight.includes('MODERATE');
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border-l-4 ${
                        isCritical ? 'bg-red-50 border-red-400' :
                        isModerate ? 'bg-yellow-50 border-yellow-400' :
                        isPositive ? 'bg-green-50 border-green-400' :
                        'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">
                          {isCritical ? '🚨' : isModerate ? '⚠️' : isPositive ? '✅' : '💡'}
                        </span>
                        <p className={`text-sm ${
                          isCritical ? 'text-red-800' :
                          isModerate ? 'text-yellow-800' :
                          isPositive ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {insight}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-gray-400 text-6xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No ATS Score Available</h3>
          <p className="text-gray-500">ATS scoring data is not available for this resume analysis.</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'contact': return renderContactInfo();
      case 'skills': return renderSkills();
      case 'experience': return renderExperience();
      case 'education': return renderEducation();
      case 'projects': return renderProjects();
      case 'analysis': return renderAnalysis();
      case 'score': return renderScore();
      default: return renderOverview();
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Resume Analysis Results</h1>
              <p className="text-gray-600">
                Comprehensive analysis of your resume with actionable insights and recommendations.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {onBackToSummary && (
                <button
                  onClick={onBackToSummary}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to Summary</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default ResumeResultsDisplay; 