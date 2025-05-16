import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { WordCounter } from './WordCounter';
import { staggerContainer, staggerItem, slideUpVariant } from './ui/page-transition';

const initialMarkdown = `# Welcome to VibeNote

## A magical markdown editor

Start typing your notes here...

### Features:
- **Real-time preview** as you type
- *Word count* and character count
- Code syntax highlighting
- GitHub Flavored Markdown support

\`\`\`javascript
// Example code block
function hello() {
  console.log("Hello, world!");
}
\`\`\`

> Inspiration is the key to creativity
`;

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isMobile, setIsMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <motion.div
      className="w-full px-8 py-10"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col md:flex-row gap-10 h-[calc(100vh-16rem)]">
        {/* Editor Section */}
        <motion.div
          className={`flex-1 flex flex-col ${isMobile && showPreview ? 'hidden' : 'flex'}`}
          variants={slideUpVariant}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Editor</h2>
            {isMobile && (
              <button
                onClick={() => setShowPreview(true)}
                className="text-sm text-primary hover:underline"
              >
                Show Preview
              </button>
            )}
          </div>

          <div className="flex-1 relative">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-full p-6 bg-card text-card-foreground rounded-lg border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-['JetBrains_Mono'] text-sm leading-relaxed"
              placeholder="Type your markdown here..."
              spellCheck="false"
            />

            <div className="absolute bottom-6 right-6">
              <WordCounter text={markdown} />
            </div>
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          className={`flex-1 flex flex-col ${isMobile && !showPreview ? 'hidden' : 'flex'}`}
          variants={slideUpVariant}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            {isMobile && (
              <button
                onClick={() => setShowPreview(false)}
                className="text-sm text-primary hover:underline"
              >
                Show Editor
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-8 bg-card text-card-foreground rounded-lg border border-border">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                root: ({ children }) => (
                  <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                    {children}
                  </div>
                ),
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
