import { motion } from "framer-motion";
const Mission = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
        >
            <section
                className="relative flex flex-col items-center justify-center text-center py-20 px-6"
                style={{
                    background: "linear-gradient(360deg, #2d6a4f, #40916c, #d4a373)",
                }}
            >
                {/* Text Content */}
                <div className="relative z-10 max-w-3xl">
                    <div className="flex flex-col gap-2 items-center pb-3">
                        <h2 className="font-bold text-2xl tracking-wide text-[#2c2c2c]">
                            Our Mission
                        </h2>
                        <hr className="h-1 rounded-xl bg-blue-600 border-0 w-30" />
                    </div>
                    <p className="text-black font-semibold text-lg leading-relaxed">
                        Our mission is to spread unadulterated teachings of Lord Krishna all over the world. So that all of us can lead a Krishna conscious life and ultimately attain love of Krishna.The purpose of human form of life is to establish relationship with Krishna and return back to the kingdom of Krishna. This is the panacea for all material sufferings. And this is the ultimate perfection of life.
                    </p>
                </div>
            </section>
        </motion.div>
    );
};

export default Mission