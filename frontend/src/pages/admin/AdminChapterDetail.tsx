import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Question {
  _id: string;
  type?: 'mcq' | 'writing' | 'multiple_select_mcq';
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  correctOptionIndices?: number[];
  sampleAnswer?: string;
  points?: number;
}

const AdminChapterDetail = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({ 
    type: 'mcq',
    questionText: '', 
    options: ['', '', '', ''], 
    correctOptionIndex: 0,
    correctOptionIndices: [],
    sampleAnswer: '',
    points: 1
  });

  const fetchData = async () => {
    try {
      const [chapterRes, questionsRes] = await Promise.all([
        axios.get(`/api/chapters/${chapterId}`),
        axios.get(`/api/chapters/${chapterId}/questions`)
      ]);
      setChapter(chapterRes.data);
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load chapter details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuestion.type === 'multiple_select_mcq' && (!currentQuestion.correctOptionIndices || currentQuestion.correctOptionIndices.length < 2)) {
      return toast.error("Please select at least two correct options for Multiple Select MCQ");
    }
    if ((currentQuestion.type === 'mcq' || currentQuestion.type === 'multiple_select_mcq' || !currentQuestion.type) && currentQuestion.options?.some(opt => !opt.trim())) {
      return toast.error("All 4 options must be filled");
    }

    try {
      if (currentQuestion._id) {
        await axios.put(`/api/questions/${currentQuestion._id}`, currentQuestion);
        toast.success("Question updated successfully");
      } else {
        await axios.post('/api/questions', { ...currentQuestion, chapterId });
        toast.success("Question created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Failed to save question");
    }
  };

  const handleDeleteClick = (question: Question) => {
    setCurrentQuestion(question);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/questions/${currentQuestion._id}`);
      toast.success("Question deleted successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const openModal = (question?: Question) => {
    setCurrentQuestion(question ? { ...question } : { 
      type: 'mcq',
      questionText: '', 
      options: ['', '', '', ''], 
      correctOptionIndex: 0,
      correctOptionIndices: [],
      sampleAnswer: '',
      points: 1
    });
    setModalType('edit');
    setIsModalOpen(true);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading Chapter Details...</p>
      </div>
    );
  }
  if (!chapter) return <div>Chapter not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/admin/books/${chapter.bookId?._id || chapter.bookId}`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{chapter.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{chapter.bookId?.title}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Questions</h2>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {questions.length > 0 ? (
            questions.map((q, index) => (
              <div key={q._id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    <span className="text-orange-500 mr-2">Q{index + 1}.</span> 
                    {q.questionText}
                    <span className={`ml-3 text-xs font-semibold px-2 py-1 rounded-full ${q.type === 'writing' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                      {q.type === 'writing' ? 'Writing' : 'MCQ'}
                    </span>
                    <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      {q.points || 1} {q.points === 1 ? 'Point' : 'Points'}
                    </span>
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openModal(q)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(q)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {q.type === 'writing' ? (
                  <div className="pl-8">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sample Answer / Rubric:</p>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{q.sampleAnswer || 'No sample answer provided.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                    {q.options?.map((opt, optIndex) => {
                      const isCorrect = q.type === 'multiple_select_mcq' 
                        ? q.correctOptionIndices?.includes(optIndex)
                        : q.correctOptionIndex === optIndex;
                      
                      return (
                        <div 
                          key={optIndex} 
                          className={`p-3 rounded-lg border flex items-center gap-3 ${
                            isCorrect 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium' 
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {isCorrect && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                          <span className={!isCorrect ? 'ml-[30px]' : ''}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              No questions found in this chapter. Click "Add Question" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className={`flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 shrink-0 ${modalType === 'delete' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
              <h2 className={`text-xl font-bold ${modalType === 'delete' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {modalType === 'delete' ? 'Delete Question' : currentQuestion._id ? 'Edit Question' : 'Add Question'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={`${modalType === 'delete' ? 'text-red-400 hover:text-red-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                <X size={24} />
              </button>
            </div>
            
            {modalType === 'delete' ? (
              <div className="p-6 space-y-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={40} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Are you sure?</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Do you really want to delete this question? This action cannot be undone.
                  </p>
                  <p className="mt-4 font-medium italic text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                    "{currentQuestion.questionText}"
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} className="px-6 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/30">
                    Yes, Delete Question
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700 flex justify-center">
                  <div className="bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg flex inline-flex w-full max-w-lg">
                    <button 
                      type="button"
                      onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'mcq' })}
                      className={`flex-1 py-2 px-2 text-sm font-medium rounded-md transition-colors ${
                        (currentQuestion.type === 'mcq' || !currentQuestion.type)
                          ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      Single MCQ
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'multiple_select_mcq' })}
                      className={`flex-1 py-2 px-2 text-sm font-medium rounded-md transition-colors ${
                        currentQuestion.type === 'multiple_select_mcq' 
                          ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      Multiple Select MCQ
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'writing' })}
                      className={`flex-1 py-2 px-2 text-sm font-medium rounded-md transition-colors ${
                        currentQuestion.type === 'writing' 
                          ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      Writing / Descriptive
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto">
                  <form id="question-form" onSubmit={handleSave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text *</label>
                      <textarea 
                        required
                        rows={3}
                        value={currentQuestion.questionText}
                        onChange={e => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="E.g., Who is the Supreme Personality of Godhead?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label>
                      <input 
                        type="number"
                        min="1"
                        required
                        value={currentQuestion.points || 1}
                        onChange={e => setCurrentQuestion({...currentQuestion, points: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    {(currentQuestion.type === 'mcq' || currentQuestion.type === 'multiple_select_mcq' || !currentQuestion.type) ? (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Options (4 Required) & Correct Answer(s)
                        </label>
                        {[0, 1, 2, 3].map((index) => (
                          <div key={index} className="flex items-center gap-3">
                            {currentQuestion.type === 'multiple_select_mcq' ? (
                              <input 
                                type="checkbox"
                                name="correctOptions"
                                checked={currentQuestion.correctOptionIndices?.includes(index) || false}
                                onChange={(e) => {
                                  const currentIndices = currentQuestion.correctOptionIndices || [];
                                  let newIndices;
                                  if (e.target.checked) {
                                    newIndices = [...currentIndices, index];
                                  } else {
                                    newIndices = currentIndices.filter(i => i !== index);
                                  }
                                  setCurrentQuestion({...currentQuestion, correctOptionIndices: newIndices});
                                }}
                                className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
                                title={`Set Option ${index + 1} as correct`}
                              />
                            ) : (
                              <input 
                                type="radio"
                                name="correctOption"
                                checked={currentQuestion.correctOptionIndex === index}
                                onChange={() => setCurrentQuestion({...currentQuestion, correctOptionIndex: index})}
                                className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                                title={`Set Option ${index + 1} as correct`}
                              />
                            )}
                            <input
                              type="text"
                              required
                              value={currentQuestion.options?.[index] || ''}
                              onChange={e => updateOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                (currentQuestion.type === 'multiple_select_mcq' ? currentQuestion.correctOptionIndices?.includes(index) : currentQuestion.correctOptionIndex === index)
                                  ? 'border-green-500 focus:ring-green-500 bg-green-50/30 dark:bg-green-900/30 text-gray-800 dark:text-gray-100' 
                                  : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 bg-transparent text-gray-800 dark:text-gray-100'
                              }`}
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {currentQuestion.type === 'multiple_select_mcq' ? 'Select checkboxes for all correct options.' : 'Select the radio button next to the correct option.'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Answer / Rubric (Optional)</label>
                        <textarea 
                          rows={5}
                          value={currentQuestion.sampleAnswer || ''}
                          onChange={e => setCurrentQuestion({...currentQuestion, sampleAnswer: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100"
                          placeholder="Provide a sample correct answer or grading rubric for evaluators..."
                        />
                      </div>
                    )}
                  </form>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0 bg-gray-50 dark:bg-gray-800/80">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" form="question-form" className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                    Save Question
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChapterDetail;
