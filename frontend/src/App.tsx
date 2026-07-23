import { Routes, Route } from 'react-router-dom';
import Register from "./pages/Register"
import LandingPage from "./pages/LandingPage"
import { Toaster } from 'react-hot-toast';
import Contact from './pages/Contact';
import About from './pages/About';

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBooks from './pages/admin/AdminBooks';
import AdminBookDetail from './pages/admin/AdminBookDetail';
import AdminChapterDetail from './pages/admin/AdminChapterDetail';
import PublicRoute from './components/PublicRoute';

import BookView from './pages/BookView';
import QuizView from './pages/QuizView';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import StudentBookDetail from './pages/StudentBookDetail';
import StudentTestReports from './pages/StudentTestReports';
import TestEngine from './pages/TestEngine';
import AdminTestReports from './pages/admin/AdminTestReports';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />

        {/* Public Views (Cannot be accessed by logged-in users) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
        <Route path="/books/:bookId" element={<BookView />} />
        <Route path="/chapters/:chapterId/quiz" element={<QuizView />} />

        {/* Student Portal (Protected logically within the components) */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/dashboard/reports" element={<StudentTestReports />} />
        <Route path="/dashboard/books/:bookId" element={<StudentBookDetail />} />
        <Route path="/take-test/:chapterId" element={<TestEngine />} />

        {/* Admin Routes (Protected by AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/:bookId" element={<AdminBookDetail />} />
          <Route path="chapters/:chapterId" element={<AdminChapterDetail />} />
          <Route path="tests" element={<AdminTestReports />} />
        </Route>

        {/* Catch-all Route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
