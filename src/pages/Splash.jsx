import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';

// Yahan logo import karein (Vite isko khud resolve karega)
import logoImg from '../assets/artisan-logo.png';

export default function Splash({ onComplete }) {
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cache check: if image is already loaded, trigger animation
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const tl = gsap.timeline();

    gsap.set(logoRef.current, { scale: 0.9, opacity: 0, y: 15, filter: "blur(10px)" });
    gsap.set(textRef.current, { opacity: 0, y: 10 });

    tl.to(logoRef.current, {
      duration: 1.8,
      scale: 1,
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      ease: "expo.out",
    })
    .to(textRef.current, {
      duration: 1.2,
      opacity: 1,
      y: 0,
      ease: "power2.out"
    }, "-=0.8")
    .to({}, { duration: 2 }) // Hold for 2s to let user see branding
    .add(() => {
      if (onComplete) onComplete();
    });

    return () => tl.kill();
  }, [onComplete, isLoaded]);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] z-[100] overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo Container */}
        <div 
          ref={logoRef} 
          className="w-40 h-40 md:w-64 md:h-64 mb-6"
          style={{ opacity: 0 }} // Start hidden via CSS
        >
          <img 
            ref={imgRef}
            src={logoImg} 
            alt="ARtisan Logo" 
            className="w-full h-full object-contain"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              console.error("Logo file still missing in src/assets/");
              setIsLoaded(true); 
            }}
          />
        </div>

        {/* Text Styling */}
        <div ref={textRef} className="text-center" style={{ opacity: 0 }}>
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-white">
            AR<span className="text-[#8B5E3C] font-semibold">TISAN</span>
          </h1>
          <p className="mt-3 text-[9px] uppercase tracking-[0.6em] text-gray-400 font-medium opacity-60">
            Digital Craftsmanship
          </p>
        </div>
      </div>
    </motion.div>
  );
}