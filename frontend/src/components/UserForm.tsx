import React, { useState } from "react";
import { motion } from "framer-motion";

interface FormData {
    name: string;
    email: string;
    dob: string;
    phone: string;
}

const FloatingSymbol: React.FC<{ src: string; top: string; left: string; size: number }> = ({ src, top, left, size }) => (
    <motion.img
        src={src}
        alt="symbol"
        className="absolute opacity-80 z-10 hidden lg:block"
        style={{ top, left, width: `${size}px`, height: `${size}px` }}
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    />
);

const UserForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        dob: "",
        phone: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data:", formData);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6">
            <FloatingSymbol src="/Chakram.png" top="70%" left="80%" size={100} />
            <FloatingSymbol src="/Lotusmm.png" top="20%" left="77%" size={150} />
            <FloatingSymbol src="/Shankhm.png" top="50%" left="70%" size={100} />
            <FloatingSymbol src="/Gada.png" top="50%" left="90%" size={100}/>
            <FloatingSymbol src="/Feathermm.png" top="20%" left="13%" size={100}/>
            <FloatingSymbol src="/Gada.png" top="50%" left="20%" size={100} />
            <FloatingSymbol src="/Lotusmm.png" top="70%" left="10%" size={150} />
            <FloatingSymbol src="/Chakram.png" top="45%" left="3%" size={100}/>

            <form
                onSubmit={handleSubmit}
                className="bg-yellow-100 relative shadow-lg rounded-xl p-8 w-full max-w-md space-y-6"
            >
                <h2 className="text-2xl p-0 font-semibold text-gray-800 text-center flex items-center justify-center">
                    <img src="/DahiHandi.png" height={100} width={100} alt="Dahi Handi Photo" />
                    <p>Register</p>
                    <img src="/image.png" alt="Bhagwad Gita Transformation" className={`ml-3`} height={120} width={120} />
                </h2>

                {/* Name */}
                <div>
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* DOB */}
                <div>
                    <label className="block text-gray-700 mb-2">Date of Birth</label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full p-3 rounded-xl gradient-btn cursor-pointer"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default UserForm;
