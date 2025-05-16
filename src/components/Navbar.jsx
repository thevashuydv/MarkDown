import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { FileText, Github } from 'lucide-react';

export function Navbar() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="w-full px-8 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 font-bold text-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <FileText className="text-primary" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 drop-shadow-sm">
            VibeNote
          </span>
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github size={18} />
            <span className="hidden sm:inline">GitHub</span>
          </motion.a>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
