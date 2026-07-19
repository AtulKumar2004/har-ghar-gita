import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye, X, Upload, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Book {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

const AdminBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null);
  const [currentBook, setCurrentBook] = useState<Partial<Book>>({ title: '', description: '', imageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/books');
      setBooks(res.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentBook._id) {
        // Update
        await axios.put(`/api/books/${currentBook._id}`, currentBook);
        toast.success("Book updated successfully");
      } else {
        // Create
        await axios.post('/api/books', currentBook);
        toast.success("Book created successfully");
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (error) {
      console.error("Error saving book:", error);
      toast.error("Failed to save book");
    }
  };

  const handleDeleteClick = (book: Book) => {
    setCurrentBook(book);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/books/${currentBook._id}`);
      toast.success("Book deleted successfully");
      setIsModalOpen(false);
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    }
  };

  const openModal = (book?: Book) => {
    setCurrentBook(book || { title: '', description: '', imageUrl: '' });
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentBook({ ...currentBook, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading Books...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Books</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={18} />
          Create Book
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {books.map(book => (
          <div key={book._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
              {book.imageUrl ? (
                <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{book.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{book.description}</p>
              
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                  <button onClick={() => openModal(book)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(book)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <Link to={`/admin/books/${book._id}`} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors text-sm font-medium">
                  <Eye size={16} />
                  Manage Chapters
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[95vh] flex flex-col shadow-2xl">
            <div className={`flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 ${modalType === 'delete' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
              <h2 className={`text-xl font-bold ${modalType === 'delete' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {modalType === 'delete' ? 'Delete Book' : currentBook._id ? 'Edit Book' : 'Create Book'}
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
                    Do you really want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">{currentBook.title}</span>? 
                    <br/><br/>
                    <span className="text-red-500 font-medium text-sm">Warning: This will also permanently delete all its chapters and MCQs.</span>
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} className="px-6 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/30">
                    Yes, Delete Book
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input 
                    type="text" 
                    required
                    value={currentBook.title}
                    onChange={e => setCurrentBook({...currentBook, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={currentBook.description}
                    onChange={e => setCurrentBook({...currentBook, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Book Cover Image</label>
                  
                  {/* Image Preview & Upload Container */}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl relative overflow-hidden group hover:border-orange-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
                    {currentBook.imageUrl ? (
                      <div className="relative w-full h-32 sm:h-40 flex items-center justify-center">
                        <img src={currentBook.imageUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Change Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                          <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none px-1">
                            <span>Upload a file</span>
                            <input 
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                    {/* Hidden input for when image already exists but user wants to change it */}
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept="image/*"
                      ref={currentBook.imageUrl ? fileInputRef : undefined}
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">OR ENTER URL</span>
                    <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
                  </div>

                  <input 
                    type="text" 
                    value={currentBook.imageUrl}
                    onChange={e => setCurrentBook({...currentBook, imageUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mt-3"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Save Book
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

export default AdminBooks;
