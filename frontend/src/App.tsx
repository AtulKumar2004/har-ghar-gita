import { Routes, Route } from 'react-router-dom';
import Register from "./pages/Register"
import LandingPage from "./pages/LandingPage"
import { Toaster } from 'react-hot-toast';
import Contact from './pages/Contact';
import About from './pages/About';
function App() {

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App
