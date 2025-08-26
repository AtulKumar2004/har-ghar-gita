import BooksImage from "/Books.png";

const Hero = () => {
    return (
        <section
            className="ralative hero flex items-center justify-center"
            style={{
                height: "90vh",
                backgroundImage: `url(${BooksImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>

            {/* Transparent Box for Text */}
            <div className="relative z-10 bg-black/40 backdrop-blur-2xs rounded-xl p-8 md:p-12 text-center w-80 h-sm md:w-md md:h-md lg:w-2xl">
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                    अध्येष्यते च य इमं धर्म्यं संवादमावयो: । <br />
                    ज्ञानयज्ञेन तेनाहमिष्ट: स्यामिति मे मति: <br />
                    ॥ BG 18.70 ॥
                </h1>
                <p className="mt-4 text-lg md:text-xl text-white drop-shadow-md">
                    And I declare that he who studies this sacred conversation of ours worships Me by his intelligence.
                </p>
                <button className="mt-6 gradient-btn px-6 py-3 text-black/80 font-semibold rounded-lg shadow-lg overflow-hidden group cursor-pointer">
                    <span className="relative">Register Now</span>
                </button>
            </div>
        </section>
    );
};

export default Hero
