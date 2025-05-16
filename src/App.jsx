import { useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { LandingPage } from './components/LandingPage'
import { MarkdownEditor } from './components/MarkdownEditor'
import { PageTransition } from './components/ui/page-transition'
import './App.css'

function App() {
  const editorRef = useRef(null);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Navbar />

      <main className="w-full">
        {/* Landing Page Section */}
        <AnimatePresence mode="wait">
          <PageTransition>
            <LandingPage />
          </PageTransition>
        </AnimatePresence>

        {/* Editor Section */}
        <section id="editor-section" ref={editorRef} className="min-h-screen py-16 w-full bg-background">
          <AnimatePresence mode="wait">
            <PageTransition delay={0.1}>
              <MarkdownEditor />
            </PageTransition>
          </AnimatePresence>
        </section>
      </main>

      <footer className="py-6 border-t border-border/50 w-full">
        <div className="w-full px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VibeNote. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
