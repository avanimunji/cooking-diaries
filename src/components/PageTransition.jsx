import { motion } from 'framer-motion'

export default function PageTransition({ children, direction = 'forward' }) {
  const variants = {
    initial: {
      x: direction === 'back' ? '100%' : '-100%',
      opacity: 0.85,
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === 'back' ? '-100%' : '100%',
      opacity: 0.85,
    },
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        type: 'spring',
        stiffness: 240,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  )
}