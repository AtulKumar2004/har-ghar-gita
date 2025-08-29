import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Facebook, Youtube, Instagram, Loader2 } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import z from "zod";
import toast from "react-hot-toast";
import axios from "axios";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const messageSchema = z.object({
    name: z.string().min(1, "All fields are required"),
    email: z.string().email("Please enter a valid email"),
    message: z.string().min(1, "All fields are required"),
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validate before setting loading
    const result = messageSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      // const res = await axios.post(`${import.meta.env.VITE_API_URL}/contact`, result.data);
      const res = await axios.post("/api/contact", result.data);
      toast.success("Message sent.Will get back soon!");
      setFormData({ name: "", email: "", message: "" });
      console.log("Message created:", res.data);
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message || "Failed to send message");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 bg-[url('/Background.jpg')] bg-no-repeat bg-cover bg-center flex flex-col items-center p-6">
        {/* Hero Section */}
        <div className="max-w-3xl text-center mt-12">
          <h1 className="text-4xl font-bold text-gray-800">Contact Us</h1>
          <p className="text-gray-600 mt-3">
            Have questions or suggestions?
            Fill out the form below or reach us through our contact details.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-12 w-full max-w-5xl">
          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg rounded-2xl p-8 space-y-6"
          >
            <div>
              <label className="block text-gray-700 font-medium mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Write your message..."
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center cursor-pointer gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all w-full"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Contact Information */}
          <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Get in Touch</h2>
            <p className="text-gray-600">
              You can also reach us via email, phone, or visit our temple.
            </p>

            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>info@harghargita.com</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-5 h-5 text-blue-600" />
              <span>+91 79787 76093</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Iskcon Patia, Near, KIIT Rd, opposite of HDFC Bank and, Bhubaneswar, India 751024</span>
            </div>

            {/* Social Media */}
            <div className="flex gap-4 mt-4">
              <a href="https://www.facebook.com/rsd.rns/" className="p-3 bg-gray-100 rounded-full hover:bg-blue-600 hover:text-white transition">
                <Facebook />
              </a>
              <a href="https://www.youtube.com/@roshan_kp" className="p-3 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white transition">
                <Youtube />
              </a>
              <a href="https://www.instagram.com/rsd.rns_24/" className="p-3 bg-gray-100 rounded-full hover:bg-purple-400 hover:text-white transition">
                <Instagram />
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
