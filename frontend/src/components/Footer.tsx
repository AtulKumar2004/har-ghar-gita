import React from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-r from-[#ac794f] to-[#ddd146]  text-gray-800 py-10" 
        >
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Section */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Links</h2>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="font-semibold hover:underline">Home</Link></li>
                        <li><Link to="/about" className="font-semibold hover:underline">About Us</Link></li>
                        <li><Link to="/contact" className="font-semibold hover:underline">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Middle Section */}
                <div className="flex flex-col items-start md:items-center lg:flex lg:flex-col lg:justify-center">
                    <h2 className="text-xl font-bold mb-4">Follow Us</h2>
                    <div className="flex space-x-4">
                        <a href="https://www.facebook.com/p/Iskcon-Baranga-Patia-61575899008250/" aria-label="Facebook">
                            <Facebook className="w-6 h-6 hover:text-gray-200" />
                        </a>
                        <a href="https://www.youtube.com/@ISKCONPATIA/featured" aria-label="Twitter">
                            <Youtube className="w-6 h-6 hover:text-gray-200" />
                        </a>
                        <a href="https://www.instagram.com/iskconpatia/" aria-label="Instagram">
                            <Instagram className="w-6 h-6 hover:text-gray-200" />
                        </a>
                    </div>
                </div>

                {/* Right Section */}
                <div className="text-sm md:text-right font-semibold lg:flex lg:flex-col lg:justify-center">
                    <p className="mb-2">Made with ❤️ by ISKCON Patia</p>
                    <p className="mb-2">© {new Date().getFullYear()} ISKCON Patia. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
