import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { X, CheckCircle, AlertTriangle, Loader2, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

interface Props {
  submissionId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const AdminSubmissionDetail: React.FC<Props> = ({ submissionId, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State to hold manual grades { questionId: awardedPoints }
  const [manualGrades, setManualGrades] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Admin_Review_${submission?.userId?.name?.replace(/\s+/g, '_')}_${submission?.chapterId?.title?.replace(/\s+/g, '_')}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subRes = await axios.get(`/api/admin/tests`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const sub = subRes.data.find((s: any) => s._id === submissionId);
        if (sub) {
          setSubmission(sub);
          const qRes = await axios.get(`/api/chapters/${sub.chapterId._id}/questions`);
          setQuestions(qRes.data);
          
          // Pre-fill manual grades from existing awardedPoints
          const initialGrades: Record<string, number> = {};
          sub.answers.forEach((ans: any) => {
            initialGrades[ans.questionId] = ans.awardedPoints || 0;
          });
          setManualGrades(initialGrades);
        }
      } catch (error) {
        toast.error("Failed to load submission details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [submissionId, user]);

  const handleSaveGrades = async () => {
    setIsSaving(true);
    try {
      const gradesArray = Object.keys(manualGrades).map(qId => ({
        questionId: qId,
        awardedPoints: manualGrades[qId]
      }));

      await axios.put(`/api/admin/tests/${submissionId}/grade`, {
        grades: gradesArray
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      toast.success("Test graded successfully and email sent!");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Failed to save grades");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  const hasWarnings = submission.warnings?.copyPasteAttempts > 0 || submission.warnings?.fullScreenExits > 0;
  const currentCalculatedScore = Object.values(manualGrades).reduce((a, b) => a + b, 0);
  const hasWritingQuestions = questions.some(q => q.type === 'writing');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={reportRef} className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] print:max-h-none flex flex-col overflow-hidden print:overflow-visible shadow-2xl">
        
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Test Review: {submission.userId?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Chapter: {submission.chapterId?.title} • Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={() => handlePrint()} className="px-3 py-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition flex items-center gap-2 font-medium text-sm shadow-sm">
              <FileDown size={18} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto print:overflow-visible bg-gray-50/30 dark:bg-gray-900/30 flex-grow">
          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[200px] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xl">
                {currentCalculatedScore}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Score</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">out of {submission.totalPoints || '?'}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[200px] shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${submission.status === 'graded' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                {submission.status === 'graded' ? <CheckCircle /> : <AlertTriangle />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <p className={`text-lg font-bold ${submission.status === 'graded' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                </p>
              </div>
            </div>
            {hasWarnings && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 flex-1 min-w-[200px] shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertTriangle />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-500 dark:text-red-400">Cheat Warnings</p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">
                    {submission.warnings.copyPasteAttempts} Copy, {submission.warnings.fullScreenExits} Exit
                  </p>
                </div>
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Answers Breakdown</h3>
          <div className="space-y-6">
            {questions.map((q, index) => {
              const ans = submission.answers.find((a: any) => a.questionId === q._id);
              const maxPoints = q.points || 1;
              const isWriting = q.type === 'writing';

              return (
                <div key={q._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-start gap-2">
                        <span className="text-orange-500">Q{index + 1}.</span> 
                        {q.questionText}
                      </h4>
                    </div>
                    <div className="shrink-0 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      Max: {maxPoints} pts
                    </div>
                  </div>

                  {!isWriting ? (
                    // MCQ Display
                    <div className="space-y-3 pl-6">
                      {q.options.map((opt: string, optIndex: number) => {
                        const isMultipleSelect = q.type === 'multiple_select_mcq';
                        const isCorrect = isMultipleSelect
                          ? q.correctOptionIndices?.includes(optIndex)
                          : q.correctOptionIndex === optIndex;
                        const isSelected = isMultipleSelect
                          ? ans?.selectedOptionIndices?.includes(optIndex)
                          : ans?.selectedOptionIndex === optIndex;
                        
                        let bgColor = "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100";
                        if (isCorrect && isSelected) bgColor = "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300";
                        else if (isCorrect) bgColor = "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300";
                        else if (isSelected) bgColor = "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300";

                        return (
                          <div key={optIndex} className={`p-3 rounded-lg border flex items-center gap-3 ${bgColor}`}>
                            {isSelected ? (isCorrect ? <CheckCircle size={18} className="text-green-500"/> : <X size={18} className="text-red-500"/>) : <div className="w-[18px]" />}
                            <span className={isCorrect ? 'font-medium' : ''}>{opt}</span>
                            {isCorrect && !isSelected && <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded">Correct Answer</span>}
                            {isSelected && !isCorrect && <span className="ml-auto text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">Student Answer</span>}
                          </div>
                        );
                      })}
                      <div className="mt-3 flex justify-end">
                        <span className="font-bold text-gray-700 dark:text-gray-300">Points Awarded: <span className={ans?.awardedPoints > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>{ans?.awardedPoints || 0}</span></span>
                      </div>
                    </div>
                  ) : (
                    // Writing Display
                    <div className="space-y-4 pl-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-orange-50/50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800/50">
                          <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-2 tracking-wider">Student's Answer</p>
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{ans?.writtenAnswer || <span className="italic text-gray-400 dark:text-gray-500">No answer provided</span>}</p>
                        </div>
                        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2 tracking-wider">Sample Rubric / Correct Answer</p>
                          <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{q.sampleAnswer || <span className="italic text-gray-400 dark:text-gray-500">None provided</span>}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-3 mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <label className="font-medium text-gray-700 dark:text-gray-200">Assign Points (0 - {maxPoints}):</label>
                        <input 
                          type="number"
                          min="0"
                          max={maxPoints}
                          value={manualGrades[q._id] ?? 0}
                          onChange={(e) => {
                            let val = Number(e.target.value);
                            if (val > maxPoints) val = maxPoints;
                            if (val < 0) val = 0;
                            setManualGrades(prev => ({...prev, [q._id]: val}));
                          }}
                          className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-orange-500 font-bold text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 shrink-0 flex justify-end gap-4 print:hidden">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
            {hasWritingQuestions ? 'Cancel' : 'Close'}
          </button>
          
          {hasWritingQuestions && (
            <button 
              onClick={handleSaveGrades} 
              disabled={isSaving}
              className="px-6 py-2.5 bg-orange-600 text-white font-medium hover:bg-orange-700 rounded-xl transition-colors shadow-lg shadow-orange-500/30 flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {submission.status === 'graded' ? 'Update Score' : 'Release Score'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubmissionDetail;
