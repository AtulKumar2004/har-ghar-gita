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
                {/* Decorative Mandala Background */}
                <div
                    className="absolute inset-0 flex justify-center items-center opacity-20"
                    style={{
                        backgroundImage: "url('/mandala.png')", // put your mandala SVG/PNG in public/
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "60%",
                    }}
                ></div>

                {/* Text Content */}
                <div className="relative z-10 max-w-3xl">
                    <h3 className="text-xl font-medium tracking-wide text-[#2c2c2c]">
                        Hub of A Spiritual Sanctuary
                    </h3>
                    <h2 className="text-5xl font-serif mt-4 mb-6 text-[#2c2c2c]">
                        Recent VIP Guests
                    </h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        ISKCON London is a dynamic place in the heart of London where the senior devotees
                        visit regularly. Don’t miss the chance to gain wisdom from these revered figures.
                        Keep an eye on our schedule page for updates on upcoming visitors.
                    </p>
                </div>
            </section>
        </motion.div>
    );
};

export default Mission