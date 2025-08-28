import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // icon package

const slides = [
  {
    id: 1,
    type: "image",
    image: "/Cover-1.png",
  },
  {
    id: 2,
    type: "image",
    image: "/Cover-2.png",
  },
  {
    id: 3,
    type: "hero",
    title:
      "अध्येष्यते च य इमं धर्म्यं संवादमावयो: । ज्ञानयज्ञेन तेनाहमिष्ट: स्यामिति मे मति: ॥ BG 18.70 ॥",
    description:
      "And I declare that he who studies this sacred conversation of ours worships Me by his intelligence.",
    buttonText: "Get Started",
    image: "/Books.png",
  },
];

const Carousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isWide, setIsWide] = useState<boolean>(window.innerWidth > 1000);

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth > 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isWide) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isWide]);

  if (!isWide) {
    const hero = slides[2];
    return (
      <div
        className="relative w-full h-[600px] bg-cover bg-center flex justify-center items-center"
        style={{ backgroundImage: `url(${hero.image})` }}
      >
        <div className="relative z-10 bg-black/40 rounded-xl p-8 md:p-12 text-center w-80 md:w-md lg:w-2xl">
          <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
            {hero.title}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white drop-shadow-md">
            {hero.description}
          </p>
          <button onClick={() => {
            document.getElementById("set-yourself")?.scrollIntoView({ behavior: "smooth" });
          }} className="mt-6 gradient-btn px-6 py-3 text-black/80 font-semibold rounded-lg shadow-lg overflow-hidden group cursor-pointer">
            <span className="relative">{hero.buttonText}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          <div
            className={`w-full h-full bg-cover bg-center ${slide.type === "hero" ? "flex justify-center items-center" : ""
              }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {slide.type === "hero" && (
              <div className="relative z-10 bg-black/40 rounded-xl p-8 md:p-12 text-center w-80 md:w-md lg:w-2xl">
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                  {"अध्येष्यते च य इमं धर्म्यं संवादमावयो: ।"}
                  <br />
                  {"ज्ञानयज्ञेन तेनाहमिष्ट: स्यामिति मे मति: "}
                  <br />
                  {"॥ BG 18.70 ॥"}
                </h1>
                <p className="mt-4 text-lg md:text-xl text-white drop-shadow-md">
                  {slide.description}
                </p>
                <button
                  onClick={() => {
                    document.getElementById("set-yourself")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-6 gradient-btn px-6 py-3 text-black/80 font-semibold rounded-lg shadow-lg overflow-hidden group cursor-pointer"
                >
                  <span className="relative">{slide.buttonText}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Left Arrow */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer bg-black/40 hover:bg-black/60 text-white p-3 rounded-full z-20"
        onClick={() =>
          setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
        }
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Arrow */}
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 cursor-pointer hover:bg-black/60 text-white p-3 rounded-full z-20"
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Carousel;
