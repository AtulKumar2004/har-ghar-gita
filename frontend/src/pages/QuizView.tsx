import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Award, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

const QuizView = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [chapter, setChapter] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chapterRes, questionsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/chapters/${chapterId}`),
          axios.get(`http://localhost:5000/api/chapters/${chapterId}/questions`)
        ]);
        setChapter(chapterRes.data);
        setQuestions(questionsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [chapterId]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === questions[currentQuestionIndex].correctOptionIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      <p className="text-gray-500 font-medium">Loading Quiz...</p>
    </div>
  );
  if (!chapter) return <div className="min-h-screen flex items-center justify-center">Chapter not found.</div>;
  if (questions.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-xl text-gray-600">No questions available for this chapter yet.</p>
      <Link to={`/books/${chapter.bookId?._id || chapter.bookId}`} className="text-orange-600 font-medium hover:underline">Go Back</Link>
    </div>
  );

  const currentQ = questions[currentQuestionIndex];
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <Link to={`/books/${chapter.bookId?._id || chapter.bookId}`} className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Book
        </Link>

        {!quizCompleted ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2">
              <div 
                className="bg-orange-500 h-2 transition-all duration-500" 
                style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
                  {chapter.title}
                </span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 leading-snug">
                {currentQ.questionText}
              </h2>

              <div className="space-y-4">
                <AnimatePresence mode='wait'>
                  {currentQ.options.map((option, index) => {
                    
                    let itemClass = "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer text-gray-700";
                    let Icon = null;

                    if (isAnswered) {
                      if (index === currentQ.correctOptionIndex) {
                        itemClass = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
                        Icon = <CheckCircle className="text-green-500" />;
                      } else if (index === selectedOption) {
                        itemClass = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
                        Icon = <XCircle className="text-red-500" />;
                      } else {
                        itemClass = "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50";
                      }
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleOptionSelect(index)}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between font-medium text-lg ${itemClass} ${!isAnswered && selectedOption === index ? 'ring-2 ring-orange-500 border-orange-500' : ''}`}
                      >
                        <span>{option}</span>
                        {Icon && <span>{Icon}</span>}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {isAnswered && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 flex justify-end"
                >
                  <button 
                    onClick={handleNext}
                    className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center"
          >
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award size={48} className="text-orange-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
            <p className="text-xl text-gray-600 mb-8">You scored {score} out of {questions.length}</p>
            
            <div className="flex justify-center items-center gap-4 mb-10">
               <div className="text-center p-4 bg-gray-50 rounded-xl w-32 border border-gray-100">
                  <span className="block text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Accuracy</span>
                  <span className={`text-2xl font-bold ${percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                    {percentage}%
                  </span>
               </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  setIsAnswered(false);
                  setSelectedOption(null);
                  setQuizCompleted(false);
                }}
                className="px-6 py-3 border-2 border-orange-200 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors"
              >
                Retake Quiz
              </button>
              <Link 
                to={`/books/${chapter.bookId?._id || chapter.bookId}`} 
                className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-md"
              >
                Back to Chapters
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
