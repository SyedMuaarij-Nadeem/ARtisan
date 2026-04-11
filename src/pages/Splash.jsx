import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function Splash() {
  const navigate = useNavigate();
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => navigate('/dashboard'), 500);
      }
    });

    gsap.set(logoRef.current, { scale: 0.5, opacity: 0, rotationY: -180 });
    gsap.set(textRef.current, { y: 20, opacity: 0 });

    tl.to(logoRef.current, {
      duration: 1.5,
      scale: 1,
      opacity: 1,
      rotationY: 0,
      ease: "power3.out",
    })
      .to(logoRef.current, {
        duration: 1,
        boxShadow: "0 0 40px rgba(0, 229, 255, 0.6)",
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut"
      }, "-=0.5")
      .to(textRef.current, {
        duration: 0.8,
        y: 0,
        opacity: 1,
        ease: "power2.out"
      }, "-=1.0")
      .to(containerRef.current, {
        duration: 0.8,
        opacity: 0,
        delay: 0.5,
        ease: "power2.inOut"
      });

    return () => tl.kill();
  }, [navigate]);

  return (
    <div ref={containerRef} className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
        <div
          ref={logoRef}
          className="w-32 h-32 md:w-48 md:h-48 mb-8 relative rounded-2xl flex items-center justify-center bg-glass border border-glass-border"
        >
          <img src="/images/artisan-logo.png" alt="ARtisan Logo" className="w-[80%] h-[80%] object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300E5FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 22h20L12 2z'/%3E%3C/svg%3E";
            }}
          />
        </div>
        <h1 ref={textRef} className="text-4xl text-accent md:text-6xl font-brand tracking-widest drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
          AR<span className="text-white">tisan</span>
        </h1>
      </div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
