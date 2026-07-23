import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import UserForm from "../components/UserForm";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import React from "react";

const Register = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Removed redirect here so logged-in users can access the registration page
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="bg-[url('/Background.jpg')] bg-no-repeat bg-cover bg-center min-h-screen"
        >
            <Navbar />
            <UserForm />
            <Footer />
        </motion.div>
    );
};

export default Register
