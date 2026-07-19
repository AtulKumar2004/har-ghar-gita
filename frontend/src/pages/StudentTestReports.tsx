import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Eye, FileDown, X, CheckCircle, AlertTriangle, Loader2, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

interface Answer {
  questionId: string;
  awardedPoints?: number;
  selectedOptionIndex?: number;
  selectedOptionIndices?: number[];
  writtenAnswer?: string;
}

interface Question {
  _id: string;
  type: string;
  points?: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  correctOptionIndices?: number[];
  sampleAnswer?: string;
}

interface TestSubmission {
  _id: string;
  chapterId: { title: string; _id: string; bookId?: { title: string } };
  score: number;
  totalPoints: number;
  status: string;
  submittedAt: string;
  answers: Answer[];
}

const StudentTestReports = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Detail Modal State
  const [selectedTest, setSelectedTest] = useState<TestSubmission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [collapsedBooks, setCollapsedBooks] = useState<Record<string, boolean>>({});
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const toggleBook = (title: string) => {
    setCollapsedBooks(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleChapter = (key: string) => {
    setCollapsedChapters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const res = await axios.get('/api/users/tests', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setSubmissions(res.data);
      } catch {
        toast.error("Failed to load your test reports");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchSubmissions();
  }, [user, navigate]);

  const openDetails = async (test: TestSubmission) => {
    setSelectedTest(test);
    setLoadingDetails(true);
    try {
      const qRes = await axios.get(`/api/chapters/${test.chapterId._id}/questions`);
      setQuestions(qRes.data);
    } catch {
      toast.error("Failed to load test questions");
    } finally {
      setLoadingDetails(false);
    }
  };

  const downloadPDF = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Test_Report_${selectedTest?.chapterId?.title?.replace(/\s+/g, '_') || 'Report'}`,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-500 font-medium">Loading your reports...</p>
        </div>
        <Footer />
      </div>
    );
  }

  type GroupedData = Record<string, {
    bookTitle: string;
    chapters: Record<string, {
      chapterTitle: string;
      submissions: TestSubmission[];
    }>
  }>;

  const groupedSubmissions = submissions.reduce((acc, sub) => {
    const bookTitle = sub.chapterId?.bookId?.title || 'Unknown Book';
    const chapterTitle = sub.chapterId?.title || 'Unknown Chapter';
    
    if (!acc[bookTitle]) {
      acc[bookTitle] = { bookTitle, chapters: {} };
    }
    if (!acc[bookTitle].chapters[chapterTitle]) {
      acc[bookTitle].chapters[chapterTitle] = { chapterTitle, submissions: [] };
    }
    acc[bookTitle].chapters[chapterTitle].submissions.push(sub);
    return acc;
  }, {} as GroupedData);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Test Reports</h1>
            <p className="text-gray-500 dark:text-gray-400">View your scores, feedback, and download test reports.</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg font-medium text-sm border border-orange-100 dark:border-orange-800/30 flex items-center gap-2">
            <BookOpen size={18} /> Student Portal
          </div>
        </div>

        <div className="space-y-8">
          {Object.values(groupedSubmissions).length > 0 ? (
            Object.values(groupedSubmissions).map((bookGroup) => (
              <div key={bookGroup.bookTitle} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button 
                  onClick={() => toggleBook(bookGroup.bookTitle)}
                  className="w-full bg-gray-800 dark:bg-gray-950 text-white p-4 font-bold text-lg flex items-center justify-between hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-orange-400" />
                    {bookGroup.bookTitle}
                  </div>
                  {collapsedBooks[bookGroup.bookTitle] ? <ChevronRight className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                
                {!collapsedBooks[bookGroup.bookTitle] && (
                  <div className="p-5 space-y-6 bg-gray-50/30 dark:bg-gray-800/50">
                    {Object.values(bookGroup.chapters).map((chapterGroup) => {
                      const chapterKey = `${bookGroup.bookTitle}-${chapterGroup.chapterTitle}`;
                      return (
                      <div key={chapterGroup.chapterTitle} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                        <button 
                          onClick={() => toggleChapter(chapterKey)}
                          className="w-full bg-gray-100/80 dark:bg-gray-700/80 p-3.5 font-bold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 text-sm tracking-wide flex items-center justify-between hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-colors"
                        >
                          <span>{chapterGroup.chapterTitle}</span>
                          {collapsedChapters[chapterKey] ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </button>
                        
                        {!collapsedChapters[chapterKey] && (
                          <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                                    <th className="p-3 pl-4">Chapter</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Score</th>
                                    <th className="p-3">Date Taken</th>
                                    <th className="p-3 text-center pr-4">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                  {chapterGroup.submissions.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                                      <td className="p-3 pl-4 font-medium text-gray-800 dark:text-gray-200">
                                        {sub.chapterId?.title || 'Unknown Chapter'}
                                      </td>
                                      <td className="p-3">
                                        {sub.status === 'pending' ? (
                                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg font-bold text-xs border border-yellow-100">
                                            <AlertTriangle size={14} /> Pending Review
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg font-bold text-xs border border-green-100">
                                            <CheckCircle size={14} /> Graded
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-3">
                                        {sub.status === 'graded' ? (
                                          <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{sub.score} / {sub.totalPoints}</span>
                                        ) : (
                                          <span className="text-gray-400 dark:text-gray-500 italic text-sm">--</span>
                                        )}
                                      </td>
                                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        {new Date(sub.submittedAt).toLocaleDateString()}
                                      </td>
                                      <td className="p-3 text-center pr-4">
                                        <button 
                                          onClick={() => openDetails(sub)}
                                          className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors text-xs font-bold inline-flex items-center gap-1"
                                        >
                                          <Eye size={14} /> View Report
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                          </div>
                        )}
                      </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
              You haven't taken any tests yet. Head to the dashboard to start learning!
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          {/* Scrollable Modal Container */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-y-auto relative max-h-[80vh]">
            
            {/* PDF Capture Target */}
            <div ref={reportRef} className="w-full bg-white dark:bg-gray-900 relative">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 sm:p-8 text-white relative">
              <div id="pdf-actions" className="absolute top-4 right-4 flex gap-2 print:hidden">
                <button 
                  onClick={downloadPDF} 
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-md text-white font-medium flex items-center gap-2"
                  title="Download PDF"
                >
                  <FileDown size={20} />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
                <button onClick={() => setSelectedTest(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-md">
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4">
                <h2 className="text-3xl font-extrabold mb-2">Test Report</h2>
                <p className="text-orange-100 text-lg">{selectedTest.chapterId.title}</p>
                <p className="text-orange-100/70 text-sm mt-1">Submitted: {new Date(selectedTest.submittedAt).toLocaleString()}</p>
              </div>

              <div className="mt-8 flex gap-6">
                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20">
                  <p className="text-orange-100 text-sm font-medium uppercase tracking-wider mb-1">Status</p>
                  <p className="text-2xl font-bold">{selectedTest.status === 'graded' ? 'Graded' : 'Pending Review'}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20">
                  <p className="text-orange-100 text-sm font-medium uppercase tracking-wider mb-1">Final Score</p>
                  <p className="text-2xl font-bold">{selectedTest.status === 'graded' ? `${selectedTest.score} / ${selectedTest.totalPoints}` : '---'}</p>
                </div>
              </div>
            </div>

            {/* Questions Body */}
            <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900">
              {loadingDetails ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Loading report details...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Questions Breakdown</h3>
                  
                  {questions.map((q, index) => {
                    const ans = selectedTest.answers.find(a => a.questionId === q._id);
                    const isWriting = q.type === 'writing';
                    const maxPoints = q.points || 1;

                    return (
                      <div key={q._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">Q{index + 1}.</span> 
                            {q.questionText}
                          </h4>
                          <div className="shrink-0 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                            {selectedTest.status === 'graded' ? (
                              <span className={(ans?.awardedPoints || 0) > 0 ? 'text-green-600' : 'text-red-500'}>
                                {ans?.awardedPoints || 0} / {maxPoints} pts
                              </span>
                            ) : (
                              <span className="text-gray-400">? / {maxPoints} pts</span>
                            )}
                          </div>
                        </div>

                        {!isWriting ? (
                          <div className="space-y-3 pl-8">
                            {q.options.map((opt: string, optIndex: number) => {
                              const isMultipleSelect = q.type === 'multiple_select_mcq';
                              const isCorrect = isMultipleSelect
                                ? q.correctOptionIndices?.includes(optIndex)
                                : q.correctOptionIndex === optIndex;
                              const isSelected = isMultipleSelect
                                ? ans?.selectedOptionIndices?.includes(optIndex)
                                : ans?.selectedOptionIndex === optIndex;
                              
                              let bgColor = "bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-200";
                              if (isCorrect && isSelected) bgColor = "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 font-medium";
                              else if (isCorrect) bgColor = "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 font-medium";
                              else if (isSelected) bgColor = "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 font-medium";

                              return (
                                <div key={optIndex} className={`p-3 rounded-lg border flex items-center gap-3 ${bgColor}`}>
                                  {isSelected ? (isCorrect ? <CheckCircle size={18} className="text-green-500 shrink-0"/> : <X size={18} className="text-red-500 shrink-0"/>) : <div className="w-[18px] shrink-0" />}
                                  <span>{opt}</span>
                                  {isCorrect && !isSelected && <span className="ml-auto text-xs font-bold text-green-600 uppercase tracking-wide">Correct Answer</span>}
                                  {isSelected && !isCorrect && <span className="ml-auto text-xs font-bold text-red-600 uppercase tracking-wide">Your Answer</span>}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="pl-8 space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wider">Your Answer</p>
                              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{ans?.writtenAnswer || <span className="italic text-gray-400 dark:text-gray-500">No answer provided</span>}</p>
                            </div>
                            
                            {selectedTest.status === 'graded' && q.sampleAnswer && (
                              <div className="bg-green-50/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/50 mt-4">
                                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-2 tracking-wider">Sample Correct Answer</p>
                                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{q.sampleAnswer}</p>
                              </div>
                            )}
                            {selectedTest.status === 'pending' && (
                              <p className="text-sm text-orange-600 italic mt-2">
                                * Your written answer is currently being reviewed by an instructor.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Report Footer */}
            <div className="bg-white dark:bg-gray-900 p-6 border-t border-gray-100 dark:border-gray-800 text-center text-gray-400 dark:text-gray-500 text-sm">
              Generated by Har Ghar Gita • {new Date().toLocaleString()}
            </div>
          </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StudentTestReports;
