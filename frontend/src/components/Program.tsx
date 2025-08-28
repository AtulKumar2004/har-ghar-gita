import { motion } from "framer-motion";
const Program = () => {
    return (
        <motion.div
            id="set-yourself"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-7"
        >
            <p className="font-bold text-2xl pb-2 bg-gradient-to-r from-black via-blue-900 to-blue-700 bg-clip-text text-transparent">Set Yourself</p>
            <hr className="h-1 rounded-xl bg-blue-600 border-0 w-30 mb-10" />
            <div className="md:flex md:justify-center items-center px-5 md:gap-10">
                <div className="flex flex-col gap-10 p-5 md:pl-20">
                    <div className="flex gap-2 justify-baseline">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md md:text-md">Register yourself</p>
                    </div>
                    <div className="flex gap-2 justify-baseline">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md md:text-md">Check for the on going book</p>
                    </div>
                    <div className="flex gap-2 justify-baseline">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md md:text-md">Get your highlighters</p>
                    </div>
                    <div className="flex gap-2 justify-baseline">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md md:text-md">Join us on zoom, every Tuesday, Wednesday & Thursday</p>
                    </div>
                    <div className="flex gap-2 justify-baseline">
                        <img src="/feather.svg" height={30} width={30} alt="Feather svg" />
                        <p className="font-semibold text-md md:text-md">Complete the weekly FAQs</p>
                    </div>
                </div>
                <img src="/Cover-1.png" className="rounded-4xl w-120 h-120 my-10 md:w-100 md:h-100" alt="Program Photo" />
            </div>
            <button className="my-5 gradient-btn px-6 py-4 text-black/80 font-semibold rounded-lg shadow-lg overflow-hidden group cursor-pointer">
                <a href="https://www.transcendstore.com/books" className="relative">Get your Physical Copy</a>
            </button>
        </motion.div>
    );
};

export default Program