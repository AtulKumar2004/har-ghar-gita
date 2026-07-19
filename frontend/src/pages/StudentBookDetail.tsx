import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2, PlayCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StudentBookDetail = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }

    const fetchData = async () => {
      try {
        const [bookRes, chaptersRes] = await Promise.all([
          axios.get(`/api/books/${bookId}`),
          axios.get(`/api/books/${bookId}/chapters`)
        ]);
        setBook(bookRes.data);
        setChapters(chaptersRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookId, user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading Chapters...</p>
      </div>
    );
  }

  if (!book) return <div>Book not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{book.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">Select a chapter to begin the test.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Chapters</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <div key={chapter._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shrink-0">
                      {chapter.order}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{chapter.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        {chapter.timeLimit && (
                          <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            <Clock size={14} /> {chapter.timeLimit} mins
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/take-test/${chapter._id}`)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-sm shrink-0"
                  >
                    <PlayCircle size={18} /> Take Test
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No chapters available for this book yet.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentBookDetail;
