import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, PlayCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface Book {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface Chapter {
  _id: string;
  title: string;
  order: number;
}

const BookView = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      <p className="text-gray-500 font-medium">Loading Book Details...</p>
    </div>
  );
  if (!book) return <div className="min-h-screen flex items-center justify-center">Book not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Link to="/" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        {/* Book Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-gray-200">
            {book.imageUrl ? (
              <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover min-h-[300px]" />
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center text-gray-400 bg-gray-100">
                <BookOpen size={64} className="opacity-20" />
              </div>
            )}
          </div>
          <div className="p-8 w-full md:w-2/3 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{book.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{book.description}</p>
            <div className="mt-auto">
              <span className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
                {chapters.length} Chapters
              </span>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Chapters</h2>
          <div className="space-y-4">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <div key={chapter._id} className="group p-5 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all flex items-center justify-between bg-gray-50 hover:bg-orange-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      {chapter.order}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{chapter.title}</h3>
                  </div>
                  <Link 
                    to={`/chapters/${chapter._id}/quiz`} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm"
                  >
                    <PlayCircle size={18} />
                    Take Quiz
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No chapters available for this book yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookView;
