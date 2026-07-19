import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Custom SVG Illustration for 404 */}
          <svg className="w-64 h-64 mx-auto text-orange-500 mb-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-orange-200" fill="currentColor" fillOpacity="0.1" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" stroke="currentColor" strokeWidth="2" />
            <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 2v2" stroke="currentColor" strokeWidth="2" />
            <path d="M12 20v2" stroke="currentColor" strokeWidth="2" />
            <path d="M20 12h2" stroke="currentColor" strokeWidth="2" />
            <path d="M2 12h2" stroke="currentColor" strokeWidth="2" />
            <path d="M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="2" />
            <path d="M6.34 17.66l-1.41 1.41" stroke="currentColor" strokeWidth="2" />
            <path d="M19.07 19.07l-1.41-1.41" stroke="currentColor" strokeWidth="2" />
            <path d="M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 tracking-tight">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">Oops! Page not found</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50"
            >
              <Home size={20} />
              Back to Homepage
            </motion.div>
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
