import { useCallback, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function useAnimate() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const characterIdRef = useRef("");
  const hasStartedInstrumentRef = useRef(false);
  const blinkTl = useRef<gsap.core.Timeline | null>(null);
  const breatheTl = useRef<gsap.core.Timeline | null>(null);
  const nodTl = useRef<gsap.core.Timeline | null>(null);
  const playInstrumentTl = useRef<gsap.core.Timeline | null>(null);
  const ringoTl = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!svgRef.current) return;

    const ctx = gsap.context(() => {
      const characterId =
        svgRef.current!.querySelector(":scope > g[id]")?.id ?? "";
      characterIdRef.current = characterId;
      hasStartedInstrumentRef.current = false;
      const eyes = svgRef.current!.querySelector("#eyes");
      const upperBody = svgRef.current!.querySelector("#head");
      const lowerBodySelector =
        characterId === "ringo" ? "#hands" : "#instrument, #hands";
      const lowerBody = Array.from(
        svgRef.current!.querySelectorAll(lowerBodySelector)
      );
      const shadow = svgRef.current!.querySelector("#shadow");

      if (!eyes || !upperBody || lowerBody.length === 0 || !shadow) return;

      blinkTl.current = gsap.timeline({ paused: true });

      blinkTl.current.to(eyes, {
        scaleY: 0.1,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        transformOrigin: "50% 50%",
        ease: "power1.inOut",
      });

      breatheTl.current = gsap.timeline({
        paused: true,
        repeat: -1,
        yoyo: true,
        defaults: { ease: "sine.inOut", duration: 1.5 },
      });

      breatheTl.current.to(upperBody, {
        y: -60,
      });

      breatheTl.current.to(
        shadow,
        {
          scaleX: 0.95,
          transformOrigin: "50% 50%",
        },
        "<"
      );

      breatheTl.current.to(
        lowerBody,
        {
          y: -40,
        },
        "<0.2"
      );

      nodTl.current = gsap.timeline({ paused: true });
      nodTl.current
        .to(upperBody, {
          yPercent: 2.5,
          ease: "power2.out",
          duration: 0.2,
        })
        .to(upperBody, {
          yPercent: 0,
          ease: "power1.in",
          duration: 0.4,
        });

      const useLeftDirection =
        characterId === "paul";
      const transformOrigin = useLeftDirection ? "left center" : "right center";
      const handDirection = useLeftDirection ? -1 : 1;
      const leftHandSelector = characterId === "ringo" ? "#left-hand" : "#instrument, #left-hand";
      const instrument = svgRef.current!.querySelectorAll(leftHandSelector);
      const rightHand = svgRef.current!.querySelector("#right-hand");

      if (characterId === "ringo") {
        if (instrument.length === 0 || !rightHand) return;
        const handOrigin = rightHand ? 'left center' : 'right center';
        ringoTl.current = gsap.timeline({ paused: true,
          repeat: -1,
          defaults:{transformOrigin: handOrigin}
        });
        ringoTl.current
          .to(rightHand, {
            yPercent: -5,
            rotate: -15,
            ease: "power2.out",
            duration: 0.3,
          })

          .to(rightHand, {
            yPercent: 20,
            rotate: 75,
            duration: 0.2,
            ease: "power1.easeOut",
          }, '<0.1')

          .to(instrument, {
            yPercent: -10,
            rotate: 45,
            ease: "power2.out",
            duration: 0.1,
          })

          .to(instrument, {
            yPercent: 80,
            xPercent: 50,
            rotate: -75,
            duration: 0.1,
            ease: "power1.easeOut",
          }, '<0.1')

          .to(rightHand, {
          yPercent: 0,
          xPercent: 0,
          rotate: 0,
          ease: "back.out(2)",
          duration: 0.2,
        })

          .to(instrument, {
          yPercent: 0,
          xPercent: 0,
          rotate: 0,
          ease: "back.out(2)",
          duration: 0.2,
        });
        return;
      }

      if (!rightHand || instrument.length === 0) return;

      playInstrumentTl.current = gsap.timeline({
        paused: true,
        repeat: -1,
        defaults: { transformOrigin },
      });

      playInstrumentTl.current
        .to(rightHand, {
          yPercent: -80,
          xPercent: 10 * handDirection,
          rotate: -45 * handDirection,
          transformOrigin,
          ease: "power1.in",
          duration: 0.3,
        })
        .to(
          rightHand,
          {
            yPercent: 30,
            xPercent: 10 * handDirection,
            rotate: -5 * handDirection,
            ease: "power3.out",
            duration: 0.2,
          },
          ">"
        )
        .to(
          instrument,
          {
            rotate: -1 * handDirection,
            duration: 0.2,
            ease: "power2.out",
          },
          "<"
        )
        .to(instrument, {
          rotate: 0,
          duration: 0.2,
          ease: "power2.out",
        })
        .to(rightHand, {
          yPercent: 0,
          xPercent: 0,
          rotate: 0,
          ease: "back.out(2)",
          duration: 0.2,
        });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  const blink = useCallback(() => {
    blinkTl.current?.restart();
  }, []);
  const breathe = useCallback(() => {
    breatheTl.current?.play();
  }, []);
  const stopBreathe = useCallback(() => {
    breatheTl.current?.pause(0);
  }, []);
  const playInstrument = useCallback(() => {
    const id = characterIdRef.current;
    if (id) console.log({ id });

    if (!hasStartedInstrumentRef.current) {
      hasStartedInstrumentRef.current = true;
      nodTl.current?.eventCallback("onComplete", () => {
        nodTl.current?.eventCallback("onComplete", null);
        if (id === "ringo") {
          ringoTl.current?.play();
        } else {
          playInstrumentTl.current?.play();
        }
      });
      nodTl.current?.restart();
    }

    return id || null;
  }, []);

  return { svgRef, blink, breathe, stopBreathe, playInstrument };
}
