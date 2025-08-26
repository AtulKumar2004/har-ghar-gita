import Hero from "./components/Hero"
import Mission from "./components/Mission"
import Navbar from "./components/Navbar"
import PrabhupadaSection from "./components/PrabhupadaSection"
import WhyJoinUs from "./components/WhyJoinUs"
import './index.css'
function App() {

  return (
    <div>
      <Navbar />
      <Hero />
      <Mission />
      <WhyJoinUs />
      <PrabhupadaSection />
    </div>
  )
}

export default App
