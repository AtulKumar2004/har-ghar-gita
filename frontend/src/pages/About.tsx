import React from "react";
import { motion } from "framer-motion";
import { Users, Target, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800">
        {/* Hero Section */}
        <section className="text-center py-16 px-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900"
          >
            Who are we?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-lg text-gray-600"
          >
            International Society for Krishna Consciousness, also popularly known as the Hare Krishna movement is a spiritual society founded by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada in July 1966 in New York. ISKCON belongs to the Gaudiya-Vaishnava sampradaya, a monotheistic tradition within Vedic culture. Today ISKCON comprises of more than 400 temples, 40 rural communities and over 100 vegetarian restaurants. It also conducts special projects throughout the world, such as “Food for Life”, the only free vegetarian relief program in the world.

The aim of ISKCON is to acquaint all people of world with universal principles of self-realization and God consciousness so that they may derive the highest benefit of spiritual understanding, unity and peace. The Vedic literature recommend that in the present age of Kali-yuga the most effective means of achieving self-realization is always hear about, glorify, and remember the all-attractive Supreme Lord Sri Krishna. Therefore, it recommends the chanting of the Holy Names: Hare Krishna Hare Krishna Krishna Krishna Hare Hare / Hare Rama Hare Rama Rama Rama Hare Hare. This sublime chanting puts the chanter directly in touch with the Supreme Lord through the sound vibration of His Holy Name.
          </motion.p>
        </section>

        {/* Mission Section */}
        <section className="py-12 bg-white shadow-inner">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900">The Guru Parampara</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                

ISKCON follows the teachings of the Vedas and Vedic scriptures, including the Bhagavad-gita and Srimad Bhagavatam which teach Vaishnavism or devotion to God (Krishna) in His Supreme Personal aspect of Sri Sri Radha Krishna.

These teachings are received through the preceptorial line known as the Brahma-Madhav-Gaudiya Vaishnava sampradaya. ISKCON is part of the disciplic succession which started with Lord Krishna Himself and continued with Srila Vyasadeva, Srila Madhavacharya, Sri Caitanya Mahaprabhu and in the present day His Divine Grace A. C. Bhaktivedanta Swami Prabhupada and his followers.
              </p>
            </motion.div>
            <motion.img
              src="/Vigraha.png"
              alt="Mission illustration"
              className="rounded-2xl shadow-lg"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 max-w-6xl mx-auto">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            What does HarGharGita Program offer?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-10 h-10 text-blue-500" />,
                title: "Community",
                desc: "Connect with devotees and develop a habit of reading Srila Prabhupada's books",
              },
              {
                icon: <Target className="w-10 h-10 text-green-500" />,
                title: "Guidance",
                desc: "Seek guidance from senior devotees of ISKCON",
              },
              {
                icon: <Sparkles className="w-10 h-10 text-yellow-500" />,
                title: "Sessions",
                desc: "Join Zoom Sessions and take classes on Bhagwad Gita,Bhagwatam and 70 volumes of Srila Prabhupada's books",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition"
                whileHover={{ scale: 1.05 }}
              >
                <div>{item.icon}</div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold"
          >
            Ready to be part of the journey?
          </motion.h2>
          <p className="mt-4 text-lg">
            Register now and take the first step in completing this lifelong mission
          </p>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.05 }}
            className="mt-6 inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-md hover:bg-gray-100"
          >
            Get Started
          </motion.a>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;
