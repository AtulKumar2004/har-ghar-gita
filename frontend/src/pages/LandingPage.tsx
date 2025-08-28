import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Mission from "../components/Mission";
import WhyJoinUs from "../components/WhyJoinUs";
import Program from "../components/Program";
import PrabhupadaSection from "../components/PrabhupadaSection";
import Footer from "../components/Footer";

const LandingPage = () => {
    return (
        <div>
            <Navbar />
            <Hero />
            <Mission />
            <WhyJoinUs />
            <Program />
            <PrabhupadaSection />
            <Footer />
        </div>
    );
};

export default LandingPage