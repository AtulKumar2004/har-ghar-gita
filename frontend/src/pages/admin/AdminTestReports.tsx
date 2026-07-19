import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertTriangle, CheckCircle, Search, Eye, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import AdminSubmissionDetail from './AdminSubmissionDetail';

interface Submission {
  _id: string;
  userId: { name: string; email: string };
  chapterId: { title: string, bookId?: { title: string } };
  score: number;
  totalPoints: number;
  status: string;
  warnings: { copyPasteAttempts: number; fullScreenExits: number };
  submittedAt: string;
}

const AdminTestReports = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  
  const [collapsedBooks, setCollapsedBooks] = useState<Record<string, boolean>>({});
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const toggleBook = (title: string) => {
    setCollapsedBooks(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleChapter = (key: string) => {
    setCollapsedChapters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (search.trim() !== '') {
      setCollapsedBooks({});
      setCollapsedChapters({});
    }
  }, [search]);

  const { user } = useAuth();

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get('/api/admin/tests', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setSubmissions(res.data);
    } catch (error) {
      console.error("Failed to load tests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchSubmissions();
    }
  }, [user]);

  const filteredSubmissions = submissions.filter(sub => {
    const s = search.toLowerCase();
    return (
      sub.userId?.name?.toLowerCase()?.includes(s) ||
      sub.userId?.email?.toLowerCase()?.includes(s) ||
      sub.chapterId?.title?.toLowerCase()?.includes(s) ||
      sub.chapterId?.bookId?.title?.toLowerCase()?.includes(s)
    );
  });

  type GroupedData = Record<string, {
    bookTitle: string;
    chapters: Record<string, {
      chapterTitle: string;
      submissions: Submission[];
    }>
  }>;

  const groupedSubmissions = filteredSubmissions.reduce((acc, sub) => {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Test Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Test Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">View student test submissions and cheat warnings</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Search book, student or chapter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="space-y-8">
        {Object.values(groupedSubmissions).length > 0 ? (
          Object.values(groupedSubmissions).map((bookGroup) => (
            <div key={bookGroup.bookTitle} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button 
                onClick={() => toggleBook(bookGroup.bookTitle)}
                className="w-full bg-gray-800 dark:bg-gray-900 text-white p-4 font-bold text-lg flex items-center justify-between hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
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
                          <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-400 uppercase tracking-wider font-semibold">
                            <th className="p-3 pl-4">Student</th>
                            <th className="p-3">Score / Status</th>
                            <th className="p-3 text-center">Warnings</th>
                            <th className="p-3">Date Submitted</th>
                            <th className="p-3 text-center pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                          {chapterGroup.submissions.map((sub) => {
                            const hasWarnings = sub.warnings?.copyPasteAttempts > 0 || sub.warnings?.fullScreenExits > 0;
                            return (
                              <tr key={sub._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-3 pl-4">
                                  <div className="font-bold text-gray-800 dark:text-gray-100">{sub.userId?.name || 'Unknown User'}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{sub.userId?.email || 'N/A'}</div>
                                </td>
                                <td className="p-3">
                                  {sub.status === 'pending' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg font-bold text-xs border border-yellow-100 dark:border-yellow-800">
                                      <AlertTriangle size={14} /> Pending
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold text-xs border border-green-100 dark:border-green-800">
                                      <CheckCircle size={14} /> {sub.score} / {sub.totalPoints}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    {hasWarnings ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded font-bold text-xs border border-red-100 dark:border-red-800">
                                        <AlertTriangle size={12} /> 
                                        {sub.warnings.copyPasteAttempts + sub.warnings.fullScreenExits} Total
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-bold text-xs border border-green-100 dark:border-green-800">
                                        <CheckCircle size={12} /> Clean
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                  {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="p-3 text-center pr-4">
                                  <button 
                                    onClick={() => setSelectedSubmissionId(sub._id)}
                                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-bold inline-flex items-center gap-1"
                                  >
                                    <Eye size={14} /> Review
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
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
            No test submissions found. Try adjusting your search.
          </div>
        )}
      </div>
      
      {selectedSubmissionId && (
        <AdminSubmissionDetail 
          submissionId={selectedSubmissionId} 
          onClose={() => setSelectedSubmissionId(null)} 
          onUpdate={fetchSubmissions}
        />
      )}
    </div>
  );
};

export default AdminTestReports;
