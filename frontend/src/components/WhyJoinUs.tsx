import { motion } from "framer-motion";

const WhyJoinUs = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-5"
        >
            <p className="font-bold text-2xl pb-2 bg-gradient-to-r from-black via-blue-900 to-blue-700 bg-clip-text text-transparent">Why Join Us?</p>
            <hr className="h-1 rounded-xl bg-blue-600 border-0 w-30 mb-10" />
            <div className="flex flex-col gap-5 md:gap-20 items-center md:flex-row md:justify-center w-full">
                <img src="/BhagwadGita.png" className="p-5 rounded-4xl max-w-90 max-h-90 md:max-w-80 md:min-h-80 lg:max-w-100 lg:h-120" alt="Reading Book" />
                <div className="rounded-xl flex flex-col p-5 gap-10">
                    <div className="flex gap-2">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md md:text-md">Find the purpose of human form of life</p>
                    </div>
                    <div className="flex gap-2">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md text-md">Strengthen your spiritual intelligence</p>
                    </div>
                    <div className="flex gap-2">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md text-md">Get rid of bad habits</p>
                    </div>
                    <div className="flex gap-2">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md text-md">Gain self-control over mind and body</p>
                    </div>
                    <div className="flex gap-2">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md text-md">Engage in devotional service to Lord Krsna</p>
                    </div>
                </div>
            </div>
            <button className="my-5 gradient-btn px-6 py-4 text-black/80 font-semibold rounded-lg shadow-lg overflow-hidden group cursor-pointer">
                <span className="relative">Register Now</span>
            </button>
        </motion.div>
    );
};

export default WhyJoinUs