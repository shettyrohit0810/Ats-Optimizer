import React, { useState, useEffect } from 'react';
import { FileText, Zap, Target, CheckCircle, BarChart3, Sparkles } from 'lucide-react';

const SkeletonCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30 animate-pulse ${className}`}>
        {children}
    </div>
);

const SkeletonLine = ({ width, height = "h-4" }: { width: string, height?: string }) => (
    <div className={`${height} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full ${width} animate-shimmer`}></div>
);

const loadingPhrases = [
    { text: "Parsing resume structure...", icon: "📄", color: "blue" },
    { text: "Scanning for keywords and skills...", icon: "🔍", color: "purple" },
    { text: "Evaluating sentence impact...", icon: "⚡", color: "green" },
    { text: "Analyzing experience alignment...", icon: "🎯", color: "orange" },
    { text: "Cross-referencing against 50+ ATS data points...", icon: "🤖", color: "indigo" },
    { text: "Checking for formatting best practices...", icon: "✨", color: "pink" },
    { text: "Compiling final recommendations...", icon: "📊", color: "teal" },
    { text: "Almost there...", icon: "🚀", color: "blue" }
];

const AnalysisLoader = () => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % loadingPhrases.length);
        }, 2500); // Change phrase every 2.5 seconds

        return () => clearInterval(interval);
    }, []);

    const currentPhrase = loadingPhrases[currentPhraseIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Progress Header */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                            <FileText className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Analyzing Your Resume
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Our AI is working hard to provide you with detailed insights
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="w-full max-w-md mx-auto mb-8">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${((currentPhraseIndex + 1) / loadingPhrases.length) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {Math.round(((currentPhraseIndex + 1) / loadingPhrases.length) * 100)}% Complete
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Sidebar - Analysis Steps */}
                        <div className="lg:col-span-1">
                            <SkeletonCard className="h-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                                    Analysis Steps
                                </h3>
                                <div className="space-y-4">
                                    {loadingPhrases.map((phrase, index) => (
                                        <div 
                                            key={index}
                                            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                                                index <= currentPhraseIndex 
                                                    ? 'bg-blue-50 border border-blue-200' 
                                                    : 'bg-gray-50'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                                index < currentPhraseIndex 
                                                    ? 'bg-green-500 text-white' 
                                                    : index === currentPhraseIndex
                                                    ? 'bg-blue-500 text-white animate-pulse'
                                                    : 'bg-gray-300 text-gray-500'
                                            }`}>
                                                {index < currentPhraseIndex ? '✓' : index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium ${
                                                    index <= currentPhraseIndex ? 'text-gray-900' : 'text-gray-500'
                                                }`}>
                                                    {phrase.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SkeletonCard>
                        </div>

                        {/* Main Content - Current Status */}
                        <div className="lg:col-span-2">
                            <SkeletonCard className="h-full">
                                <div className="text-center py-12">
                                    {/* Current Status */}
                                    <div className="mb-8">
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl ${
                                            currentPhrase.color === 'blue' ? 'bg-blue-100' :
                                            currentPhrase.color === 'purple' ? 'bg-purple-100' :
                                            currentPhrase.color === 'green' ? 'bg-green-100' :
                                            currentPhrase.color === 'orange' ? 'bg-orange-100' :
                                            currentPhrase.color === 'indigo' ? 'bg-indigo-100' :
                                            currentPhrase.color === 'pink' ? 'bg-pink-100' :
                                            currentPhrase.color === 'teal' ? 'bg-teal-100' : 'bg-blue-100'
                                        }`}>
                                            {currentPhrase.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {currentPhrase.text}
                                        </h3>
                                        <p className="text-gray-600">
                                            This may take a few moments...
                                        </p>
                                    </div>

                                    {/* Animated Dots */}
                                    <div className="flex justify-center space-x-2 mb-8">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>

                                    {/* Preview Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                            <div className="flex items-center mb-4">
                                                <Target className="w-6 h-6 text-blue-500 mr-2" />
                                                <h4 className="font-semibold text-blue-900">ATS Score</h4>
                                            </div>
                                            <div className="text-3xl font-bold text-blue-600 mb-2">--</div>
                                            <SkeletonLine width="w-full" height="h-2" />
                                        </div>
                                        
                                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                            <div className="flex items-center mb-4">
                                                <Zap className="w-6 h-6 text-purple-500 mr-2" />
                                                <h4 className="font-semibold text-purple-900">Keywords</h4>
                                            </div>
                                            <div className="text-3xl font-bold text-purple-600 mb-2">--</div>
                                            <SkeletonLine width="w-full" height="h-2" />
                                        </div>
                                    </div>
                                </div>
                            </SkeletonCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisLoader; 