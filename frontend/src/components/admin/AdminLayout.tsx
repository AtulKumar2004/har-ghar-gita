import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, LogOut, FileText, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Books', path: '/admin/books', icon: <BookOpen size={20} /> },
    { name: 'Test Reports', path: '/admin/tests', icon: <FileText size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <Link to="/admin" className="text-lg font-bold text-orange-600 dark:text-orange-400 truncate">
            #HarGharGita Admins
          </Link>
          <button 
            className="md:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path) || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[150px] sm:max-w-xs">
              {navItems.find(item => isActive(item.path))?.name || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button 
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-gray-300 sm:w-5 sm:h-5" /> : <Moon size={18} className="text-gray-600 sm:w-5 sm:h-5" />}
            </button>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:inline-block truncate max-w-[100px]">{user?.name || 'Admin'}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold uppercase text-sm shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <button onClick={handleLogout} className="ml-1 sm:ml-2 p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0" title="Logout">
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
