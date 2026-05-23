import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// Final Assets Import
import heroImg from '../assets/hero-bg.jpg';
import galleryImg from '../assets/gallery.jpg';
import realityImg from '../assets/reality_new.png';

export default function Landing() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();



  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    // Disable Lenis smooth scrolling on touch devices to prevent mobile scroll lock issues
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="min-h-dvh bg-[#F4F1EE] text-[#1A1A1A] font-inter selection:bg-[#8B5E3C]/30 overflow-x-hidden"
    >

      {/* Texture Overlay (Grain) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <Navbar />

      <main className="relative z-10">

        {/* SECTION 1: HERO */}
        <section className="relative h-dvh flex items-center justify-center px-3 sm:px-4 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.img
              style={{ y: parallaxY }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
              src={heroImg}
              className="w-full h-[120%] origin-top object-cover brightness-[0.7] contrast-[1.1]"
              alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#F4F1EE]"></div>
          </div>

          <div className="container mx-auto relative z-10 flex flex-col items-center px-2 sm:px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="backdrop-blur-xl bg-white/[0.04] border border-white/10 p-6 sm:p-10 md:p-12 lg:p-16 text-center w-full max-w-[90%] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-2xl"
            >
              <motion.span variants={itemVariants} className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.4em] sm:tracking-[0.6em] lg:tracking-[0.8em] font-black text-[#8B5E3C] mb-4 sm:mb-6 block">
                Premium AI Interior Design
              </motion.span>

              <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extralight tracking-tight leading-[1.1] mb-6 sm:mb-8 text-white">
                Design your space <br />
                <span className="italic font-serif font-light text-[#8B5E3C]">with ARtisan</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="max-w-xl mx-auto text-[#F4F1EE]/90 text-xs sm:text-sm md:text-base font-light leading-relaxed mb-8 sm:mb-10">
                Visualize your dream space instantly. Generate custom furniture with AI and experience it in your home through Augmented Reality.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Link to="/signup" className="w-full sm:w-auto bg-[#8B5E3C] text-white px-8 sm:px-10 py-4 text-[10px] sm:text-[11px] uppercase tracking-widest font-black hover:bg-white hover:text-black transition-all duration-500 shadow-2xl text-center">
                  Start Designing
                </Link>
                <Link to="/assets" className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white font-bold border-b border-[#8B5E3C] pb-1 hover:text-[#8B5E3C] transition-all">
                  View Library
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: GALLERY */}
        <section className="py-16 sm:py-24 md:py-0 md:min-h-dvh flex items-center bg-[#EAE3DB] relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-20 grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center py-12 md:py-20">
            <motion.div
              whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -50 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <span className="text-[#8B5E3C] text-[10px] sm:text-[11px] font-black tracking-[0.5em] uppercase mb-4 sm:mb-6 block">The Digital Gallery</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light mb-6 sm:mb-8 leading-tight">
                Curated <br /><span className="italic font-serif text-black/20">Assets</span>
              </h2>
              <p className="text-black/70 text-base sm:text-lg lg:text-xl font-light mb-8 sm:mb-10 leading-relaxed max-w-md">
                Browse high-fidelity 3D models carved by AI, optimized for real-world spatial placement.
              </p>
              <Link to="/assets" className="group flex items-center gap-4 sm:gap-6 text-[11px] uppercase tracking-[0.5em] font-black">
                Explore Library
                <span className="w-8 sm:w-12 h-[1px] bg-[#8B5E3C] group-hover:w-16 sm:group-hover:w-24 transition-all duration-700"></span>
              </Link>
            </motion.div>

            <motion.div
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative aspect-[4/5] max-h-[70vh] shadow-2xl overflow-hidden mx-auto w-full max-w-md lg:max-w-none group"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={galleryImg}
                className="w-full h-full object-cover"
                alt="Gallery"
              />
              <div className="absolute bottom-0 right-0 bg-[#0D0D0D] text-[#F4F1EE] p-4 sm:p-6 md:p-8 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                <p className="text-[10px] tracking-[0.5em] uppercase font-black">Artisan Studio v1.1</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3: REALITY */}
        <section className="py-16 sm:py-24 md:py-0 md:min-h-dvh flex items-center bg-[#EBE9E4]">
          <div className="container mx-auto px-4 sm:px-6 text-center py-12 md:py-20 w-full">
            <motion.h2
              whileInView={{ y: 0, opacity: 1 }} initial={{ y: 40, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: "-100px" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light mb-8 sm:mb-12 md:mb-16 tracking-tighter text-[#1A1A1A]"
            >
              Image to <span className="italic font-serif text-[#8B5E3C]">Reality</span>
            </motion.h2>

            <motion.div
              whileInView={{ y: 0, opacity: 1 }} initial={{ y: 40, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true, margin: "-100px" }}
              className="relative group max-w-5xl mx-auto aspect-video max-h-[60vh] overflow-hidden shadow-2xl bg-black"
            >
              <img src={realityImg} className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-all duration-1000" alt="Reality" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 translate-y-4 group-hover:translate-y-0"
                >
                  <Link to="/image-to-3d" className="bg-[#8B5E3C] text-white px-6 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-[0.4em] sm:tracking-[0.6em] font-black hover:bg-white hover:text-black transition-all shadow-2xl whitespace-nowrap">
                    Begin Reconstruction
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer id="contact" className="py-16 sm:py-20 md:py-28 bg-[#0D0D0D] text-[#F4F1EE] px-4 sm:px-6 md:px-10 border-t border-white/5">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

          {/* Brand & Info Column */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-3xl sm:text-4xl tracking-[0.4em] uppercase mb-4 block font-light">
                AR<span className="italic font-serif text-[#8B5E3C]">tisan</span>
              </span>
              <p className="text-[10px] text-[#F4F1EE]/40 uppercase tracking-[0.6em] font-medium mb-12">
                Sculpting the digital frontier.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#8B5E3C] mb-2">Reach Us</h4>
                  <p className="text-white/60 font-light text-sm">contact@artisan-studio.io</p>
                  <p className="text-white/60 font-light text-sm">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#8B5E3C] mb-2">Location</h4>
                  <p className="text-white/60 font-light text-sm">123 Digital Avenue<br />Silicon Valley, CA 94025</p>
                </div>
              </div>
            </div>

            <div className="mt-16 flex gap-8 text-[10px] uppercase tracking-widest text-[#F4F1EE]/60 font-medium">
              <Link to="/assets" className="hover:text-[#8B5E3C] transition-colors">Library</Link>
              <Link to="/image-to-3d" className="hover:text-[#8B5E3C] transition-colors">Studio</Link>
              <p className="opacity-30">© 2026 ARTISAN</p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="bg-white/[0.02] border border-white/5 p-8 sm:p-10 backdrop-blur-xl relative">
            {/* Subtle corner accent */}
            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-[#8B5E3C]/30" />

            <h3 className="text-xl sm:text-2xl font-light mb-8">Send an Inquiry</h3>

            <form action="https://formspree.io/f/xojrpjzw" method="POST" className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 ml-1">Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  className="w-full bg-transparent border-b border-white/10 px-1 py-2 text-sm text-white focus:outline-none focus:border-[#8B5E3C] transition-colors"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 ml-1">Email</label>
                <input
                  required
                  type="email"
                  name="email"
                  className="w-full bg-transparent border-b border-white/10 px-1 py-2 text-sm text-white focus:outline-none focus:border-[#8B5E3C] transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 ml-1">Message</label>
                <textarea
                  required
                  name="message"
                  rows="4"
                  className="w-full bg-transparent border-b border-white/10 px-1 py-2 text-sm text-white focus:outline-none focus:border-[#8B5E3C] transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8B5E3C] text-white py-4 mt-4 text-[10px] uppercase tracking-[0.4em] font-medium hover:bg-white hover:text-black transition-all"
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}