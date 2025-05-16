import { motion } from 'framer-motion';
import { ArrowDown, FileText, Sparkles, Zap, Code } from 'lucide-react';
import { AuroraBackground } from './ui/aurora-background';
import { staggerContainer, staggerItem, slideUpVariant } from './ui/page-transition';
import { PointerHighlight } from './ui/pointer-highlight';

export function LandingPage() {
  const scrollToEditor = () => {
    const editorSection = document.getElementById('editor-section');
    if (editorSection) {
      // Add a small delay to ensure animations complete
      setTimeout(() => {
        editorSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  return (
    <AuroraBackground className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden pt-16">

      {/* Floating elements */}
      <motion.div
        className="absolute top-1/3 left-1/5 text-primary/20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Code size={64} />
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-1/5 text-primary/20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <FileText size={48} />
      </motion.div>

      {/* Hero content */}
      <motion.div
        className="w-full px-6 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={staggerItem}
          className="flex items-center justify-center mb-6"
        >
          <Sparkles className="text-primary mr-2" size={32} />

          <PointerHighlight>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              VibeNote
            </h1>
          </PointerHighlight>

        </motion.div>

        <motion.h2
          variants={staggerItem}
          className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto font-light tracking-wide"
        >
          A magical markdown editor with real-time preview and word count
        </motion.h2>

        <motion.div
          variants={staggerItem}
          className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12"
        >
          <motion.div variants={staggerItem} className="flex items-center gap-2 bg-card dark:bg-card/90 p-3 rounded-lg border border-border shadow-sm">
            <Zap className="text-primary" size={20} />
            <span className="text-foreground dark:text-white font-medium">Real-time preview</span>
          </motion.div>
          <motion.div variants={staggerItem} className="flex items-center gap-2 bg-card dark:bg-card/90 p-3 rounded-lg border border-border shadow-sm">
            <FileText className="text-primary" size={20} />
            <span className="text-foreground dark:text-white font-medium">Word & character count</span>
          </motion.div>
          <motion.div variants={staggerItem} className="flex items-center gap-2 bg-card dark:bg-card/90 p-3 rounded-lg border border-border shadow-sm">
            <Code className="text-primary" size={20} />
            <span className="text-foreground dark:text-white font-medium">Syntax highlighting</span>
          </motion.div>
        </motion.div>

        <motion.button
          onClick={scrollToEditor}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground dark:text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
          variants={slideUpVariant}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Writing
          <ArrowDown size={18} />
        </motion.button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ArrowDown className="text-foreground/50" />
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
}
