import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye, X, ArrowLeft, Loader2, Play } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Chapter {
  _id: string;
  title: string;
  order: number;
  timeLimit?: number;
}

const AdminBookDetail = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Partial<Chapter>>({ title: '', order: 0, timeLimit: 30 });

  const fetchData = async () => {
    try {
      const [bookRes, chaptersRes] = await Promise.all([
        axios.get(`/api/books/${bookId}`),
        axios.get(`/api/books/${bookId}/chapters`)
      ]);
      setBook(bookRes.data);
      setChapters(chaptersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentChapter._id) {
        await axios.put(`/api/chapters/${currentChapter._id}`, currentChapter);
        toast.success("Chapter updated successfully");
      } else {
        await axios.post('/api/chapters', { ...currentChapter, bookId });
        toast.success("Chapter created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving chapter:", error);
      toast.error("Failed to save chapter");
    }
  };

  const handleDeleteClick = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/chapters/${currentChapter._id}`);
      toast.success("Chapter deleted successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Failed to delete chapter");
    }
  };

  const openModal = (chapter?: Chapter) => {
    setCurrentChapter(chapter || { title: '', order: chapters.length + 1, timeLimit: 30 });
    setModalType('edit');
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading Book Details...</p>
      </div>
    );
  }
  if (!book) return <div>Book not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/books')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="dark:text-gray-200" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{book.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Manage Chapters</p>
          {book.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-3xl">{book.description}</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Chapters</h2>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={18} />
            Add Chapter
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {chapters.length > 0 ? (
            chapters.map((chapter) => (
              <div key={chapter._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm mb-3">
                      {chapter.order}
                    </span>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{chapter.title}</h3>
                    {chapter.timeLimit && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Time Limit: {chapter.timeLimit} mins
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Link to={`/admin/chapters/${chapter._id}`} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium flex items-center gap-1">
                    <Eye size={16} /> Manage Questions
                  </Link>
                  <Link to={`/take-test/${chapter._id}`} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm font-medium flex items-center gap-1">
                    <Play size={16} /> Take Test
                  </Link>
                  <button onClick={() => openModal(chapter)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(chapter)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No chapters found. Click "Add Chapter" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md overflow-hidden">
            <div className={`flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 ${modalType === 'delete' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
              <h2 className={`text-xl font-bold ${modalType === 'delete' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {modalType === 'delete' ? 'Delete Chapter' : currentChapter._id ? 'Edit Chapter' : 'Add Chapter'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={`${modalType === 'delete' ? 'text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}>
                <X size={24} />
              </button>
            </div>
            
            {modalType === 'delete' ? (
              <div className="p-6 space-y-6 text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={40} className="text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Are you sure?</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Do you really want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">{currentChapter.title}</span>? 
                    <br/><br/>
                    <span className="text-red-500 dark:text-red-400 font-medium text-sm">Warning: This will also permanently delete all its questions.</span>
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} className="px-6 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/30">
                    Yes, Delete Chapter
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chapter Title *</label>
                  <input 
                    type="text" 
                    required
                    value={currentChapter.title}
                    onChange={e => setCurrentChapter({...currentChapter, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order (Sequence Number)</label>
                  <input 
                    type="number" 
                    value={currentChapter.order}
                    onChange={e => setCurrentChapter({...currentChapter, order: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (Minutes)</label>
                  <input 
                    type="number" 
                    value={currentChapter.timeLimit || ''}
                    onChange={e => setCurrentChapter({...currentChapter, timeLimit: Number(e.target.value)})}
                    placeholder="E.g. 30"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Save Chapter
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookDetail;
