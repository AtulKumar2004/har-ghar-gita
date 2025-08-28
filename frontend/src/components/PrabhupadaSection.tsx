import FAQAccordion from "./FAQ";
import UserForm from "./UserForm";
import { motion } from "framer-motion"

const PrabhupadaSection = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
        >
            <div className="flex flex-col">
                <p className="font-bold bg-gradient-to-r from-[#4b2e1a] via-[#5c3b23] to-[#a67c52] bg-clip-text text-transparent text-xl mt-3 text-center font-serif p-4">HIS DIVINE GRACE A.C BHAKTIVEDANTA SWAMI SRILA PRABHUPADA</p>
                <p className="text-black text-md text-center px-4 mb-7">Founder Acarya of International Society for Krishna Consciousness</p>
                <img src="/PrabhupadaPhoto.png" className="h-full w-full" alt="Srila Prabhupada photo" />
                <div className="bg-white bg-[url('/Background.jpg')] bg-no-repeat bg-cover bg-center">
                    <p className="font-semibold text-black pt-10 px-10 w-full flex items-center justify-center">ISKCON was founded in 1966 in New York by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada, affectionately known as Srila Prabhupada by his followers. With great effort and determination, at the age of 69 (when most people are retired), he journeyed from Kolkata to New York by cargo ship hoping to help the people of the Western world to reconnect with their spiritual essence. He sought to pass on the ancient teachings of bhakti-yoga and demonstrated how to practically apply this knowledge to live a happy and fulfilling life.

                        Srila Prabhupada has unlocked the secrets and sacred spiritual knowledge in the Vedic tradition and made them accessible to everyone. His “Bhagavad-Gita As It Is” is the largest selling edition of the Bhagavad-Gita in the Western world and translated in over 76 languages.</p>
                    <UserForm />
                    <FAQAccordion />
                </div>
            </div>
        </motion.div>
    );
};

export default PrabhupadaSection