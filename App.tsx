
import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import MarkdownRenderer from './components/MarkdownRenderer';
import HistoryPanel from './components/HistoryPanel';
import ViolationIcon from './components/icons/ViolationIcon';
import StarIcon from './components/icons/StarIcon';
import ProgressBar from './components/ProgressBar';
import ViolationsList from './components/ViolationsList';
import Rating from './components/Rating';
import { analyzeUI } from './services/geminiService';
import type { AnalysisResult, ImageData, HistoryEntry, Violation, ScoredAnalysisSection } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';


const ExplanationRenderer: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content.replace(/<good>(.*?)<\/good>/g, '<span class="text-green-400">$1</span>');
    return <p className="text-gray-400" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const ScoredAnalysis: React.FC<{ analysis: ScoredAnalysisSection[] }> = ({ analysis }) => {
  if (!analysis || analysis.length === 0) {
    return null;
  }

  const getStarColor = (score: number): string => {
    if (score >= 5) return 'text-green-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-500';
  };

  const getHeaderColor = (score: number): string => {
    if (score >= 5) return 'text-green-300';
    if (score >= 4) return 'text-orange-300';
    return 'text-red-400';
  };


  return (
    <div className="space-y-6 mt-6 pt-6 border-t border-gray-700">
      {analysis.map((section) => {
        const starColor = getStarColor(section.score);
        const headerColor = getHeaderColor(section.score);
        return (
          <div key={section.category}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-lg font-semibold ${headerColor}`}>{section.category}</h3>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className="w-5 h-5"
                    filled={star <= section.score}
                    colorClass={starColor}
                  />
                ))}
              </div>
            </div>
            <ExplanationRenderer content={section.explanation} />
          </div>
        );
      })}
    </div>
  );
};


function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('analysisHistory', []);
  const [hoveredViolation, setHoveredViolation] = useState<Violation | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Starting analysis...');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            if (interval) clearInterval(interval);
            return 95;
          }
          const increment = Math.random() * 10;
          const newProgress = Math.min(prev + increment, 95);

          if (newProgress < 50) {
            setLoadingMessage('Uploading and preparing image...');
          } else {
            setLoadingMessage('Performing detailed UI/UX analysis...');
          }
          return newProgress;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleAnalyze = useCallback(async (imageData: ImageData) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setAnalysisResult(null);
    setOriginalImage(imageData);
    setFeedbackSubmitted(false);

    try {
      const result = await analyzeUI(imageData);
      setAnalysisResult(result);

      const newHistoryEntry: HistoryEntry = {
        id: Date.now(),
        originalImage: imageData,
        analysisResult: result,
        timestamp: new Date().toISOString(),
      };
      setHistory(prevHistory => [newHistoryEntry, ...prevHistory]);

    } catch (e: any) {
      console.error(e);
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setProgress(100);
      setLoadingMessage('Analysis complete!');
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [setHistory]);
  
  const handleStartNew = () => {
    setAnalysisResult(null);
    setOriginalImage(null);
    setError(null);
    setIsLoading(false);
    setFeedbackSubmitted(false);
  }

  const handleRatingSubmit = useCallback((rating: number, feedback: string) => {
    console.log('Feedback submitted:', { rating, feedback });
    setFeedbackSubmitted(true);
    // In a real app, you would send this to a server
  }, []);

  const handleLoadFromHistory = (entry: HistoryEntry) => {
    // This logic handles old history entries which might have a different shape
    const resultToLoad: AnalysisResult = {
        // Provide defaults for all fields in the current AnalysisResult shape
        overallAnalysis: (entry.analysisResult as any).overallAnalysis || (entry.analysisResult as any).text || 'Analysis data not found.',
        scoredAnalysis: entry.analysisResult.scoredAnalysis || [],
        violations: entry.analysisResult.violations || [],
    };
    
    setAnalysisResult(resultToLoad);
    setOriginalImage(entry.originalImage);
    setError(null);
    setIsLoading(false);
  };
  
  const handleClearHistory = () => {
    setHistory([]);
  };

  const clearError = useCallback(() => setError(null), []);

  const renderAnalysisView = () => {
    if (isLoading) {
       return (
         <div className="flex flex-col items-center justify-center bg-gray-800/80 backdrop-blur-sm p-10 rounded-lg h-full max-w-2xl mx-auto shadow-2xl border border-gray-700">
             <h2 className="text-2xl font-bold text-white mb-4">Analysis in Progress</h2>
             <ProgressBar progress={progress} className="mb-4 w-full" />
             <div className="flex items-center text-gray-300">
                <Spinner className="w-5 h-5 mr-3"/>
                <span>{loadingMessage}</span>
             </div>
         </div>
       );
    }

    if (error) {
       return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center p-4 mt-6 max-w-lg w-full">
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Oh no!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
               <button 
                 onClick={handleStartNew}
                 className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
               >
                 Try Again
               </button>
            </div>
          </div>
       );
    }
    
    if (analysisResult && originalImage) {
      const getTooltipStyle = (violation: Violation | null): React.CSSProperties => {
        if (!violation) return { opacity: 0, visibility: 'hidden' };

        const { x, y } = violation.coordinates;
        let transformX = 'translateX(1.5rem)'; // 24px

        // If the marker is on the far right, flip the tooltip to the left
        if (x > 75) {
          transformX = 'translateX(-100%) translateX(-1.5rem)';
        }

        return {
          left: `${x}%`,
          top: `${y}%`,
          transform: `${transformX} translateY(-50%)`, // Always vertically centered
          opacity: 1,
          visibility: 'visible',
        };
      };

      const tooltipStyle = getTooltipStyle(hoveredViolation);

      return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-2xl">
                  <h2 className="text-3xl font-bold mb-6 text-white border-b-2 border-gray-700 pb-3">
                      AI Analysis
                  </h2>
                  <MarkdownRenderer content={analysisResult.overallAnalysis} />
                  <ScoredAnalysis analysis={analysisResult.scoredAnalysis} />
                  <ViolationsList violations={analysisResult.violations} onHoverViolation={setHoveredViolation} />
              </div>
              <div className="lg:col-span-2 self-start sticky top-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4 text-white text-center">Original Design</h3>
                    <div className="relative flex justify-center">
                      <img src={originalImage.url} alt="Original design" className="max-h-[60vh] w-auto rounded-md border-2 border-gray-700 object-contain" />
                       {analysisResult.violations.map((violation) => {
                        const isHovered = hoveredViolation?.id === violation.id;
                        return (
                          <div
                            key={violation.id}
                            className="absolute"
                            style={{
                              left: `${violation.coordinates.x}%`,
                              top: `${violation.coordinates.y}%`,
                            }}
                            onMouseEnter={() => setHoveredViolation(violation)}
                            onMouseLeave={() => setHoveredViolation(null)}
                            aria-describedby={`violation-tooltip-${violation.id}`}
                          >
                            <div className={`w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/80 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-transform duration-200 ring-2 ring-white/50 transform hover:scale-125 ${isHovered ? 'scale-125 ring-4' : 'ring-2'}`}>
                              <ViolationIcon className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        );
                      })}
                       {hoveredViolation && (
                        <div
                          id={`violation-tooltip-${hoveredViolation.id}`}
                          role="tooltip"
                          className="absolute w-64 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-lg text-sm z-10 pointer-events-none transition-all duration-200"
                          style={tooltipStyle}
                        >
                          <h4 className="font-bold text-indigo-400 mb-1">{hoveredViolation.category}</h4>
                          <p className="text-gray-300">{hoveredViolation.description}</p>
                        </div>
                      )}
                    </div>
                </div>
              </div>
            </div>
            
            {!feedbackSubmitted && (
                <div className="pt-4">
                    <Rating onSubmit={handleRatingSubmit} />
                </div>
            )}

            <div className="text-center pt-4">
                <button 
                  onClick={handleStartNew}
                  className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Analyze Another Image
                </button>
            </div>
          </div>
        );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            fUXit <span className="text-indigo-400">Analyzer</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Upload your app screenshot to get an instant, AI-powered design critique.
          </p>
        </header>
        
        {(!analysisResult && !isLoading && !error) ? (
          <div className="flex flex-col items-center">
              <main className="w-full">
                <ImageUploader onAnalyze={handleAnalyze} isLoading={isLoading} clearError={clearError} />
              </main>
              {history.length > 0 && (
                <aside className="w-full max-w-2xl mt-12">
                   <HistoryPanel 
                     history={history}
                     onLoadFromHistory={handleLoadFromHistory}
                     onClearHistory={handleClearHistory}
                   />
                </aside>
              )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3">
               <HistoryPanel 
                 history={history}
                 onLoadFromHistory={handleLoadFromHistory}
                 onClearHistory={handleClearHistory}
               />
            </aside>
            <main className="lg:col-span-9">
              {renderAnalysisView()}
            </main>
          </div>
        )}
         <footer className="text-center py-8 mt-10 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            Vibe coded with love by{' '}
            <a
              href="https://solakidis.notion.site/Solakidis-Panagiotis-b0cb7b286fae481191b0d0a3814afc9b"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Solakidis Panagiotis
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
