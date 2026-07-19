import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BookOpen, Layers, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    chapters: 0,
    questions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.token) return;
      try {
        const res = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: <Users size={24} />, color: 'bg-blue-500', link: '/admin/users' },
    { title: 'Total Books', value: stats.books, icon: <BookOpen size={24} />, color: 'bg-orange-500', link: '/admin/books' },
    { title: 'Total Chapters', value: stats.chapters, icon: <Layers size={24} />, color: 'bg-green-500', link: '/admin/books' },
    { title: 'Total Questions', value: stats.questions, icon: <CheckCircle size={24} />, color: 'bg-purple-500', link: '/admin/books' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link to={card.link} key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center text-white shadow-sm`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{card.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link to="/admin/books" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Manage Books
          </Link>
          <Link to="/admin/users" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            View Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
