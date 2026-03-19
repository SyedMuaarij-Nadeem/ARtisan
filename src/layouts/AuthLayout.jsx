import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedBackground } from '../components/AnimatedBackground';

const pageVariants = {
  initial: (direction) => {
    switch (direction) {
      case 'flip-right': return { rotateY: 90, opacity: 0 };
      case 'flip-left': return { rotateY: -90, opacity: 0 };
      case 'swipe-left': return { x: 300, opacity: 0 };
      case 'swipe-right': return { x: -300, opacity: 0 };
      default: return { opacity: 0, y: 20 };
    }
  },
  animate: {
    rotateY: 0,
    x: 0,
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  exit: (direction) => {
    switch (direction) {
      case 'flip-right': return { rotateY: -90, opacity: 0 };
      case 'flip-left': return { rotateY: 90, opacity: 0 };
      case 'swipe-left': return { x: -300, opacity: 0 };
      case 'swipe-right': return { x: -300, opacity: 0 };
      default: return { opacity: 0, scale: 0.95 };
    }
  }
};

export default function AuthLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  if (!outlet) return null;

  // Read transition direction from navigation state
  const direction = location.state?.direction || 'fade';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ perspective: '2000px' }}>
      <AnimatedBackground />
      
      <div className="relative w-full max-w-md flex items-center justify-center">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full absolute z-10"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
