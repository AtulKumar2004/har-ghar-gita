import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TestEngine = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [chapter, setChapter] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Test State
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  
  // Anti-cheat & Timer
  const [warnings, setWarnings] = useState({ copyPaste: 0, fullScreen: 0 });
  const warningsRef = useRef({ copyPaste: 0, fullScreen: 0 });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [chapterRes, questionsRes] = await Promise.all([
          axios.get(`/api/chapters/${chapterId}`),
          axios.get(`/api/chapters/${chapterId}/questions`)
        ]);
        setChapter(chapterRes.data);
        setQuestions(questionsRes.data);
        setTimeLeft((chapterRes.data.timeLimit || 30) * 60);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load test");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [chapterId, user, navigate]);

  // Anti-cheat effect
  useEffect(() => {
    if (!isTestStarted || isSubmitted) return;

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        if (!isSubmittingRef.current && !isSubmitted) {
          warningsRef.current.fullScreen += 1;
          setWarnings(warningsRef.current);
          toast.error(`Warning ${warningsRef.current.fullScreen}: You exited full screen!`, { icon: '⚠️', duration: 4000 });
        }
      } else {
        setIsFullScreen(true);
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      warningsRef.current.copyPaste += 1;
      setWarnings(warningsRef.current);
      toast.error(`Warning ${warningsRef.current.copyPaste}: Copy/Paste is strictly prohibited!`, { icon: '🚫', duration: 4000 });
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isTestStarted, isSubmitted]);

  // Timer effect
  useEffect(() => {
    if (isTestStarted && !isSubmitted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestStarted, isSubmitted, timeLeft]);

  const startTest = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
      }
      setIsTestStarted(true);
      setIsFullScreen(true);
    } catch {
      toast.error("Failed to enter full screen. Please allow full screen access.");
    }
  };

  const handleAnswerChange = (questionId: string, value: any, type: string) => {
    setAnswers(prev => {
      const prevAnswer = prev[questionId] || {};
      if (type === 'writing') {
        return { ...prev, [questionId]: { ...prevAnswer, writtenAnswer: value } };
      } else if (type === 'multiple_select_mcq') {
        const currentIndices = prevAnswer.selectedOptionIndices || [];
        let newIndices;
        if (currentIndices.includes(value)) {
          newIndices = currentIndices.filter((i: number) => i !== value);
        } else {
          newIndices = [...currentIndices, value];
        }
        return { ...prev, [questionId]: { ...prevAnswer, selectedOptionIndices: newIndices } };
      } else {
        return { ...prev, [questionId]: { ...prevAnswer, selectedOptionIndex: value } };
      }
    });
  };

  const handleInitialSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = isAutoSubmit;
    if (isSubmitted) return;
    
    setShowConfirmModal(false);

    setIsSubmitting(true);
    isSubmittingRef.current = true;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.error(e));
    }

    // Calculate basic score for MCQs on the frontend (optional since backend recalculates)
    let score = 0;
    const formattedAnswers = questions.map(q => {
      const ans = answers[q._id];
      if (q.type === 'mcq' && ans?.selectedOptionIndex === q.correctOptionIndex) {
        score += 1;
      }
      // Note: Backend recalculates all scores anyway, including multiple_select_mcq
      return {
        questionId: q._id,
        ...ans
      };
    });

    try {
      await axios.post('/api/tests/submit', {
        chapterId,
        answers: formattedAnswers,
        warnings: {
          copyPasteAttempts: warnings.copyPaste,
          fullScreenExits: warnings.fullScreen
        },
        score
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      toast.success("Test submitted successfully!");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit test data");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium">Preparing your test...</p>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
        <p className="text-gray-800 dark:text-gray-100 font-bold text-xl">Submitting your test...</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Please do not close this window</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Test Submitted!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your answers have been recorded successfully. Thank you for completing the test.</p>
          <button 
            onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
            className="w-full py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {!isTestStarted ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{chapter.title} - Test</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Read the instructions carefully before starting.</p>
            
            <div className="space-y-4 bg-orange-50 dark:bg-orange-900/30 p-6 rounded-xl text-orange-900 dark:text-orange-200 text-sm mb-8 border border-orange-100 dark:border-orange-800/30">
              <p className="flex items-start gap-2">
                <Clock className="w-5 h-5 shrink-0" />
                <span>You have <strong>{chapter.timeLimit || 30} minutes</strong> to complete this test. The timer will start immediately.</span>
              </p>
              <p className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
                <span><strong>Anti-Cheat Active:</strong> The test will run in full screen. Exiting full screen, copying, or pasting will be recorded as warnings and reported to your instructor.</span>
              </p>
            </div>

            <button 
              onClick={startTest}
              className="w-full py-4 bg-orange-600 text-white text-lg rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/30"
            >
              I Understand, Start Test
            </button>
          </div>
        </div>
      ) : !isFullScreen && !isSubmitted ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-center">
          <AlertTriangle className="w-24 h-24 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Full Screen Required</h1>
          <p className="text-gray-300 mb-8 max-w-md text-lg">
            You have exited full screen mode. This has been recorded as a warning. You must return to full screen to continue your test.
          </p>
          <button 
            onClick={startTest}
            className="px-8 py-4 bg-orange-600 text-white text-lg rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/30"
          >
            Return to Full Screen
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center shrink-0 z-10">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{chapter.title}</h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
          </header>

          {/* Test Content */}
          <main className="flex-grow overflow-y-auto p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              {questions.map((q, index) => (
                <div key={q._id} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                    <span className="text-orange-500 font-bold mr-2">Q{index + 1}.</span>
                    {q.questionText}
                  </h3>

                  {q.type === 'writing' ? (
                    <textarea 
                      className="w-full h-40 p-4 bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none outline-none text-gray-900 dark:text-gray-100"
                      placeholder="Type your answer here..."
                      value={answers[q._id]?.writtenAnswer || ''}
                      onChange={e => handleAnswerChange(q._id, e.target.value, 'writing')}
                    />
                  ) : (
                    <div className="space-y-3">
                      {q.options?.map((opt: string, optIndex: number) => {
                        const isSelected = q.type === 'multiple_select_mcq' 
                          ? answers[q._id]?.selectedOptionIndices?.includes(optIndex)
                          : answers[q._id]?.selectedOptionIndex === optIndex;
                        return (
                          <label 
                            key={optIndex} 
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500'
                            }`}
                          >
                            <input 
                              type={q.type === 'multiple_select_mcq' ? 'checkbox' : 'radio'}
                              name={`question-${q._id}`}
                              className="w-5 h-5 text-orange-600 focus:ring-orange-500 mr-3"
                              checked={isSelected || false}
                              onChange={() => handleAnswerChange(q._id, optIndex, q.type || 'mcq')}
                            />
                            <span className="text-gray-700 dark:text-gray-200">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>

          {/* Footer Submitter */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex justify-end">
              <button 
                onClick={handleInitialSubmit}
                className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
              >
                Submit Test
              </button>
            </div>
          </footer>

          {/* Custom Confirm Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Submit Test?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to submit your answers? You won't be able to change them later.</p>
                
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestEngine;
