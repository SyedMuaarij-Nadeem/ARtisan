import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import Navbar from '../components/Navbar';
import Particles from '../components/Particles';

export default function Landing() {
  const { user } = useAuth();
  const [displayText, setDisplayText] = useState('');
  const fullText = "Design the future with";
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => setIsTypingDone(true), 300);
      }
    }, 80);

    return () => {
      lenis.destroy();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative selection:bg-accent/30 font-poppins">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={["#00e5ff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <Navbar />

      <div className="relative z-10">
        {/* Section 1: Hero */}
        <section id="hero" className="min-h-screen flex flex-col justify-center w-full px-4 sm:px-6 lg:px-8 pt-32">
          <div className="container mx-auto">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.2]">
                {displayText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1 h-10 md:h-14 bg-accent ml-1 align-middle"
                  style={{ display: isTypingDone ? 'none' : 'inline-block' }}
                />
                <br />
                <AnimatePresence>
                  {isTypingDone && (
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="text-transparent bg-clip-text bg-linear-to-r from-accent to-blue-500 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)] font-brand inline-block mt-2 pl-2"
                    >
                      ARtisan
                    </motion.span>
                  )}
                </AnimatePresence>
              </h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isTypingDone ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <p className="text-base text-white/60 mb-10 max-w-xl leading-relaxed font-light">
                  Step into the next generation of AI and Augmented Reality. Create immersive 3D experiences seamlessly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={user ? "/dashboard" : "/signup"}>
                    <Button className="py-4! px-8! text-lg w-full sm:w-auto shadow-[0_0_20px_rgba(0,229,255,0.3)] group font-semibold">
                      {user ? "Go to Dashboard" : "Start Creating Now"}
                      <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
                    </Button>
                  </Link>
                  {!user && (
                    <Link to="/login">
                      <Button variant="secondary" className="py-4! px-8! text-lg w-full sm:w-auto border-white/10 hover:bg-white/5 font-light">
                        View Demo
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 2: 3D Asset Library */}
        <section id="library" className="min-h-screen flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-black/5">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center max-w-6xl">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">3D Asset <br /><span className="text-accent font-poppins">Library</span></h2>
              <p className="text-base text-white/60 mb-8 leading-relaxed max-w-lg font-light">
                Browse thousands of high-quality, game-ready 3D assets optimized for AR. One-click integration for your workspace.
              </p>
              <Link to="/assets">
                <Button className="py-3! px-6! text-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] font-semibold">Browse Library</Button>
              </Link>
            </div>
            <div className="aspect-square max-w-md mx-auto w-full rounded-2xl bg-glass border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent/5 mix-blend-overlay group-hover:bg-accent/10 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1/2 h-1/2 border-2 border-dashed border-accent/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute text-accent/40 font-poppins text-xl font-light">3D Preview</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Text to 3D */}
        <section id="text-to-3d" className="min-h-screen flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center max-w-6xl">
            <div className="order-2 lg:order-1 aspect-video rounded-2xl bg-linear-to-br from-accent/10 to-transparent border border-white/5 relative flex items-center justify-center max-w-md w-full mx-auto">
              <div className="text-white/20 font-poppins italic text-2xl font-light">Imagine it. Render it.</div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Text to <br /><span className="text-blue-400 font-poppins tracking-tighter">Dimension</span></h2>
              <p className="text-base text-white/60 mb-8 leading-relaxed max-w-lg font-light">
                Describe your vision in natural language and watch our neural engine generate complex 3D geometry in seconds.
              </p>
              <Link to="/signup">
                <Button className="py-3! px-6! text-lg font-semibold">Try Text-to-3D</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 4: Image to 3D */}
        <section id="image-to-3d" className="min-h-screen flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-accent/[0.02]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 font-poppins">Image to <span className="text-accent underline decoration-accent/30 underline-offset-8">Reality</span></h2>
            <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Transform any 2D photo into a fully textured 3D model. The most advanced photogrammetry pipeline ever built.
            </p>
            <Link to="/signup">
              <Button className="py-4! px-8! text-lg shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:scale-105 transition-transform font-semibold">
                Upload Your Image
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-md py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8 font-poppins">
            <div>
              <span className="text-3xl text-accent tracking-wider mb-2 block font-poppins font-bold">AR<span className="text-white">tisan</span></span>
              <p className="text-sm text-white/30 italic font-light">Sculpting the digital frontier.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex gap-10">
                <a href="#" className="text-sm text-white/40 hover:text-accent transition-colors font-light">Privacy Policy</a>
                <a href="#" className="text-sm text-white/40 hover:text-accent transition-colors font-light">Terms of Service</a>
              </div>
              <p className="text-xs text-white/20 font-light">
                &copy; {new Date().getFullYear()} ARtisan Inc. Crafted with precision.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
