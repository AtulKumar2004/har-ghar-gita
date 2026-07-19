import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
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

    const fetchBooks = async () => {
      try {
        const res = await axios.get('/api/books');
        setBooks(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome, {user?.name}!</h1>
            <p className="text-gray-500 dark:text-gray-400">Select a book below to view its chapters and take tests.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard/reports')} className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg font-bold text-sm border border-orange-200 dark:border-orange-800/50 hover:bg-orange-200 dark:hover:bg-orange-900 transition-colors">
              My Test Reports
            </button>
            <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg font-medium text-sm border border-orange-100 dark:border-orange-800/30">
              Student Portal
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BookOpen className="text-orange-500" /> Available Books
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/dashboard/books/${book._id}`)}>
              {book.imageUrl ? (
                <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <BookOpen size={48} className="text-orange-300" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-1">{book.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">{book.description || 'No description available.'}</p>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Click to view chapters</span>
                  <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-gray-700 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
