import { motion } from "framer-motion";
import { FaHeart, FaMusic } from "react-icons/fa";

export default function AnimatedLogo({
  showText = true,
  text = 'MATCHMYMUSIC',
  size = '6xl', // Tailwind size string, e.g. '6xl', '4xl', etc.
  className = '',
  iconColor = 'text-orange-500',
}) {
  // Map size prop to Tailwind classes
  const iconSizeClass = `text-${size}`;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Ondes musicales */}
        <motion.div
          className="absolute w-24 h-24 rounded-full border-4 border-orange-400"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Icône principale */}
        <motion.div
          className="text-4xl"
          style={{ color: '#ff9100' }}
          whileHover={{ rotate: 10 }}
        >
          <FaMusic />
        </motion.div>

        {/* Petit cœur animé */}
        <motion.div
          className="absolute bottom-0 right-0 text-2xl"
          style={{ color: '#ff9100' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <FaHeart />
        </motion.div>
      </motion.div>

      {/* Texte du site (optional) */}
      {showText && (
        <motion.h1
          className="mt-6 text-4xl font-bold text-orange-600 tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {text}
        </motion.h1>
      )}
    </div>
  );
}
