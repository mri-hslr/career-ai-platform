import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  // 1. Setup motion values to track the mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 2. Handle the mouse movement over the entire Hero section
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Calculate mouse position relative to the center of the screen (-1 to 1)
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  // 3. Create smooth spring animations based on the mouse position
  const springConfig = { damping: 25, stiffness: 150 };
  
  // Tilt the robot up to 15 degrees based on mouse position
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-15, 15]), springConfig);
  // Add a slight movement/shift as well
  const translateX = useSpring(useTransform(mouseX, [-1, 1], [-20, 20]), springConfig);
  const translateY = useSpring(useTransform(mouseY, [-1, 1], [-20, 20]), springConfig);

  return (
    // Added onMouseMove to the main container
    <div 
      className="relative w-full flex flex-col items-center"
      onMouseMove={handleMouseMove}
    >
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* LEFT SIDE: Text Content (Unchanged) */}
        <div className="flex flex-col justify-center items-start gap-6 text-left mt-[-5vh]">
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Your <br/> True <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#0ea5e9]">
              Career Trajectory
            </span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-slate-800 max-w-lg leading-relaxed font-semibold bg-white/20 backdrop-blur-[2px] p-4 rounded-2xl shadow-sm border border-white/40"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Guided AI analysis that takes you from confusion to clarity. Join as a student, mentor, or parent to map out the future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <Link 
              to="/signin" 
              className="px-8 py-4 bg-[#3b82f6] text-white text-center font-bold rounded-full hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all z-20"
            >
              Start Your Journey
            </Link>
            <button className="px-8 py-4 bg-white/70 text-slate-800 font-bold rounded-full hover:bg-white/90 backdrop-blur-md border border-white/80 transition-all shadow-sm z-20">
              See How It Works
            </button>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Interactive Visual/Robot */}
        {/* Added perspective to the parent container so the 3D tilt looks real */}
        <div className="flex justify-center items-center relative h-full w-full" style={{ perspective: 1000 }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            // Apply the 3D rotation and translation here!
            style={{ 
              rotateX, 
              rotateY, 
              x: translateX, 
              y: translateY 
            }}
            // Added cursor-pointer and a hover scale effect
            className="relative z-10 -mt-16 lg:-mt-24 w-full flex justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
            whileTap={{ scale: 0.95 }} // Squish slightly when clicked
          >
            <img 
              src="/robo.png" 
              alt="AI Mascot" 
              className="w-full max-w-[450px] lg:max-w-[550px] object-contain -scale-x-100" 
              style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.15)) hue-rotate(210deg) saturate(1.2)' }}
            />
          </motion.div>
          
          {/* Subtle blue glow behind the robot */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#3b82f6]/15 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        className="mt-20 lg:mt-32 flex flex-col items-center z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-xs mb-2 uppercase tracking-widest font-extrabold text-slate-600/90">Scroll to Explore</span>
        <div className="w-[2px] h-10 bg-gradient-to-b from-slate-500/90 to-transparent rounded-full shadow-md" />
      </motion.div>

    </div>
  );
}