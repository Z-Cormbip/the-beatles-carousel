import JohnSvg from "./assets/svg/john.svg?react";
import PaulSvg from "./assets/svg/paul.svg?react";
import GeorgeSvg from "./assets/svg/george.svg?react";
import RingoSvg from "./assets/svg/ringo.svg?react";
import LockSvg from "./assets/svg/lock.svg?react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type RefAttributes,
  type SVGProps as ReactSVGProps,
} from "react";
import { useAnimate } from "./assets/hooks/useAnimate";
import gsap from "gsap";
import { IoRefreshCircleOutline } from "react-icons/io5";

type CharacterSlideProps = {
  bg: string;
  Svg: ComponentType<
    ReactSVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>
  >;
  isActive: boolean;
  onCharacterClick: (id: string) => void;
};

const CharacterSlide = ({
  bg,
  Svg,
  isActive,
  onCharacterClick,
}: CharacterSlideProps) => {
  const { svgRef, blink, breathe, stopBreathe, playInstrument } = useAnimate();
  const blinkTimerRef = useRef<gsap.core.Tween | null>(null);

  const clearBlinkTimer = () => {
    blinkTimerRef.current?.kill();
    blinkTimerRef.current = null;
  };

  const scheduleRandomBlink = () => {
    clearBlinkTimer();
    const delay = gsap.utils.random(2.5, 5, 0.1);
    blinkTimerRef.current = gsap.delayedCall(delay, () => {
      if (isActive) {
        blink();
        scheduleRandomBlink();
      }
    });
  };

  useEffect(() => {
    if (!isActive) {
      clearBlinkTimer();
      stopBreathe();
    }
  }, [isActive, stopBreathe]);

  useEffect(() => {
    return () => {
      clearBlinkTimer();
      stopBreathe();
    };
  }, [stopBreathe]);

  return (
    <div className={`${bg} flex h-150 justify-center items-center`}>
      <div
        className="hover:cursor-pointer h-100 w-100 flex items-center justify-center"
        onMouseEnter={() => {
          if (!isActive) return;
          blink();
          scheduleRandomBlink();
          breathe();
        }}
        onMouseLeave={() => {
          clearBlinkTimer();
          stopBreathe();
        }}
        onClick={() => {
          const id = playInstrument();
          if (id) onCharacterClick(id);
        }}
      >
        <Svg ref={svgRef} className="w-106 max-w-none overflow-visible" />
      </div>
    </div>
  );
};

const App = () => {
  const slides = [
    { id: "paul", bg: "bg-paul", Svg: PaulSvg },
    { id: "john", bg: "bg-john", Svg: JohnSvg },
    { id: "george", bg: "bg-george", Svg: GeorgeSvg },
    { id: "ringo", bg: "bg-ringo", Svg: RingoSvg },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [clickedCharacters, setClickedCharacters] = useState<Set<string>>(
    () => new Set(),
  );
  const [showFinalFrame, setShowFinalFrame] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);

  const allCharactersClicked = clickedCharacters.size === slides.length;

  useEffect(() => {
    let finalFrameTimer: ReturnType<typeof setTimeout> | null = null;
    let refreshButtonTimer: ReturnType<typeof setTimeout> | null = null;

    if (allCharactersClicked) {
      finalFrameTimer = setTimeout(() => {
        setShowFinalFrame(true);
        refreshButtonTimer = setTimeout(() => {
          setShowRefreshButton(true);
        }, 1000);
      }, 2200);
    } else {
      setShowFinalFrame(false);
      setShowRefreshButton(false);
    }

    return () => {
      if (finalFrameTimer) clearTimeout(finalFrameTimer);
      if (refreshButtonTimer) clearTimeout(refreshButtonTimer);
    };
  }, [allCharactersClicked]);

  const handleCharacterClick = (id: string) => {
    setClickedCharacters((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  const goPrev = () => {
    setActiveIndex((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  };
  const goNext = () => {
    setActiveIndex((current) =>
      current === slides.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <main className="max-w-200 mx-auto py-30 relative">
      {/* carousel frames */}
      <div
        className={`relative overflow-hidden ${showFinalFrame ? "hidden" : ""}`}
      >
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 group hover:cursor-pointer z-1"
        >
          <IoIosArrowBack className="arrow-btn" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute group hover:cursor-pointer right-4 top-1/2 -translate-y-1/2 group z-1"
        >
          <IoIosArrowForward className="arrow-btn" />
        </button>
        <ul
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map(({ id, bg, Svg }) => (
            <li key={id} className="w-full shrink-0">
              <CharacterSlide
                bg={bg}
                Svg={Svg}
                isActive={slides[activeIndex].id === id}
                onCharacterClick={handleCharacterClick}
              />
            </li>
          ))}
        </ul>
        <ul className="flex items-end gap-2 absolute bottom-8 left-1/2 -translate-x-1/2">
          {slides.map(({ id, bg }, index) => (
            <li
              key={id}
              className={`${bg} h-5 w-5 rounded-full transition-transform duration-300 ${
                index === activeIndex
                  ? "scale-110 border border-[#1C1927]/75 saturate-150 opacity-100"
                  : "opacity-70"
              }`}
            ></li>
          ))}
          <li>
            <LockSvg className="w-6" />
          </li>
        </ul>
      </div>
      {/* final frame */}
      <div
        className={`relative overflow-hidden group ${showFinalFrame ? "" : "hidden"}`}
      >
        <h1 className="text-[64px] absolute -top-1/3 left-1/2 -translate-x-1/2 transition-all ease-in duration-800 group-hover:top-44 -tracking-widest">
          the
        </h1>
        <h1 className="text-[140px] absolute -bottom-1/3 left-1/2 -translate-x-1/2 transition-all duration-800 ease-in group-hover:bottom-1/2 group-hover:translate-y-1/2 -tracking-widest">
          BEATLES
        </h1>
        <ul className="grid grid-cols-2 h-150">
          {slides.map(({ id, bg, Svg }) => (
            <li
              key={id}
              className={`${bg} flex justify-center items-center h-75 w-100`}
            >
              <Svg className="w-50" />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
          className={`absolute bottom-8 right-8 rounded-full text-[#f5f1e8] transition-opacity duration-300 ease-in hover:cursor-pointer hover:opacity-100 ${
            showRefreshButton ? "opacity-75" : "opacity-0 pointer-events-none"
          }`}
        >
          <IoRefreshCircleOutline className="size-12" />
        </button>
      </div>
    </main>
  );
};
export default App;
