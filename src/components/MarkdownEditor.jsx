import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { WordCounter } from './WordCounter';
import { staggerContainer, staggerItem, slideUpVariant } from './ui/page-transition';

const LOCAL_STORAGE_KEY = 'vibenote-markdown';
const VERSION_HISTORY_KEY = 'vibenote-history';

const SNIPPETS = [
  { label: "Table", value: `| Header 1 | Header 2 |\n| --- | --- |\n| Row 1 | Row 2 |\n` },
  { label: "Code Block", value: "```\nlanguage\n// code here\n```\n" },
  { label: "Callout", value: "> **Note:** Your callout here\n" },
  { label: "Checklist", value: "- [ ] Task 1\n- [x] Task 2\n" },
];

const EMOJIS = ["😀","😃","😄","😁","😆","😅","😂","🙂","🙃","😉","😊","😍","🥰","😎","🤓","😜","🤔","👍","🔥","🎉","💡","✅","❌"];

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
  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [split, setSplit] = useState(50); // percent
  const [dragging, setDragging] = useState(false);
  const [findReplace, setFindReplace] = useState({ open: false, find: '', replace: '', caseSensitive: false });
  const textareaRef = useRef(null);
  const imageCounter = useRef(1);

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

  // --- Local Storage Autosave & Version History ---
  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setMarkdown(saved);
    const savedHistory = localStorage.getItem(VERSION_HISTORY_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    // Autosave to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, markdown);
    // Save version history (max 20)
    setHistory(prev => {
      if (prev.length === 0 || prev[prev.length - 1] !== markdown) {
        const newHistory = [...prev, markdown].slice(-20);
        localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
      }
      return prev;
    });
  }, [markdown]);

  const restoreVersion = (ver) => {
    setMarkdown(ver);
    setShowHistory(false);
  };

  // --- Snippets ---
  const insertSnippet = (snippet) => {
    insertAtCursor(snippet);
    setShowSnippets(false);
  };

  // --- Emoji Picker ---
  const insertEmoji = (emoji) => {
    insertAtCursor(emoji);
    setShowEmojis(false);
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement !== textareaRef.current) return;
      if (e.ctrlKey || e.metaKey) {
        let handled = true;
        if (e.key === 'b') { // Bold
          wrapSelection('**');
        } else if (e.key === 'i') { // Italic
          wrapSelection('*');
        } else if (e.key === 'e') { // Inline code
          wrapSelection('`');
        } else if (e.key === 'k') { // Code block
          wrapSelection('\n```\n', '\n```\n');
        } else if (e.key === 'l') { // Link
          wrapSelection('[', '](url)');
        } else if (e.key === 'f') { // Find/Replace
          setFindReplace(fr => ({ ...fr, open: true }));
        } else {
          handled = false;
        }
        if (handled) e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [markdown]);

  const wrapSelection = (before, after = null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = markdown.substring(start, end);
    const b = before;
    const a = after !== null ? after : before;
    const newText = markdown.substring(0, start) + b + sel + a + markdown.substring(end);
    setMarkdown(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + b.length;
      textarea.selectionEnd = end + b.length;
    }, 0);
  };

  // --- Split Pane Resizing ---
  const startDrag = (e) => {
    setDragging(true);
    document.body.style.cursor = 'col-resize';
  };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      let x = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = document.body.getBoundingClientRect();
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(20, Math.min(80, percent));
      setSplit(percent);
    };
    const stop = () => {
      setDragging(false);
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging]);

  // --- Find & Replace ---
  const doFind = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { find, caseSensitive } = findReplace;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(find, flags);
    const match = regex.exec(markdown);
    if (match) {
      textarea.focus();
      textarea.selectionStart = match.index;
      textarea.selectionEnd = match.index + match[0].length;
    }
  };
  const doReplace = () => {
    const { find, replace, caseSensitive } = findReplace;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(find, flags);
    setMarkdown(markdown.replace(regex, replace));
  };

  // Copy markdown to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      setCopied(false);
    }
  };

  // Export markdown as .md file
  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file drop or selection
  const handleFile = (file) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        setImagePreview(url);
        // Insert placeholder markdown image syntax at cursor
        const placeholder = `uploaded-image-${imageCounter.current++}`;
        setImageMap((prev) => ({ ...prev, [placeholder]: url }));
        insertAtCursor(`![${file.name}](${placeholder})`);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, just insert a link
      const url = URL.createObjectURL(file);
      insertAtCursor(`[${file.name}](${url})`);
    }
  };

  // Insert text at cursor position in textarea
  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMarkdown(markdown + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = markdown.substring(0, start);
    const after = markdown.substring(end);
    setMarkdown(before + text + after);
    // Move cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  };

  // Drag-and-drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // File input handler
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
    e.target.value = '';
  };

  return (
    <motion.div
      className="w-full px-8 py-10 bg-background text-primary"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Top right action buttons */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setShowHistory(true)}
          className="px-3 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted transition-colors flex items-center gap-1"
          title="Version History"
        >
          🕑 History
        </button>
        <button
          onClick={() => setShowSnippets(v => !v)}
          className="px-3 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted transition-colors flex items-center gap-1"
          title="Insert Snippet"
        >
          ▼ Snippets
        </button>
        <button
          onClick={() => setShowEmojis(v => !v)}
          className="px-3 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted transition-colors flex items-center gap-1"
          title="Insert Emoji"
        >
          😊
        </button>
        <button
          onClick={() => setFindReplace(fr => ({ ...fr, open: true }))}
          className="px-3 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted transition-colors flex items-center gap-1"
          title="Find & Replace"
        >
          🔍
        </button>
        <button
          onClick={handleCopy}
          className="px-3 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted transition-colors"
          title="Copy Markdown"
        >
          {copied ? "Copied!" : "Copy Markdown"}
        </button>
        <button
          onClick={handleExport}
          className="px-3 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted transition-colors"
          title="Export Markdown"
        >
          Export Markdown
        </button>
      </div>

      {/* Snippet dropdown */}
      {showSnippets && (
        <div className="absolute z-20 mt-2 bg-card border border-border rounded shadow p-2 flex flex-col gap-1">
          {SNIPPETS.map(s => (
            <button
              key={s.label}
              className="text-left px-2 py-1 hover:bg-muted rounded text-xs"
              onClick={() => insertSnippet(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmojis && (
        <div className="absolute z-20 mt-2 bg-card border border-border rounded shadow p-2 flex flex-wrap gap-1 max-w-xs">
          {EMOJIS.map(e => (
            <button
              key={e}
              className="text-xl hover:bg-muted rounded px-1"
              onClick={() => insertEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Version History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h3 className="font-bold mb-2">Version History</h3>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
              {history.slice().reverse().map((ver, i) => (
                <div key={i} className="border-b border-border pb-2 mb-2">
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={() => restoreVersion(ver)}
                  >
                    Restore
                  </button>
                  <pre className="whitespace-pre-wrap text-xs mt-1">{ver.slice(0, 200)}{ver.length > 200 ? '...' : ''}</pre>
                </div>
              ))}
            </div>
            <button className="mt-4 px-3 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted" onClick={() => setShowHistory(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Find & Replace Modal */}
      {findReplace.open && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center"></div>
          <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-xs w-full fixed z-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <h3 className="font-bold mb-2">Find & Replace</h3>
            <input
              className="w-full mb-2 p-1 border border-border rounded"
              placeholder="Find"
              value={findReplace.find}
              onChange={e => setFindReplace(fr => ({ ...fr, find: e.target.value }))}
              autoFocus
            />
            <input
              className="w-full mb-2 p-1 border border-border rounded"
              placeholder="Replace"
              value={findReplace.replace}
              onChange={e => setFindReplace(fr => ({ ...fr, replace: e.target.value }))}
            />
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={findReplace.caseSensitive}
                onChange={e => setFindReplace(fr => ({ ...fr, caseSensitive: e.target.checked }))}
              />
              Case sensitive
            </label>
            <div className="flex gap-2">
              <button className="px-2 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted" onClick={doFind}>Find</button>
              <button className="px-2 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted" onClick={doReplace}>Replace All</button>
              <button className="px-2 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted" onClick={() => setFindReplace(fr => ({ ...fr, open: false }))}>Close</button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col md:flex-row gap-0 h-[calc(100vh-16rem)] relative">
        {/* Add horizontal gap for desktop */}
        <div className="flex flex-1 flex-col md:flex-row gap-0 md:gap-x-8 h-full w-full">
          {/* Editor Section */}
          <motion.div
            className={`flex flex-col ${isMobile && showPreview ? 'hidden' : 'flex'}`}
            style={{ flex: `0 0 ${split}%`, minWidth: 0 }}
            variants={slideUpVariant}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Editor</h2>
              <div className="flex gap-2 items-center">
                <label className="px-2 py-1 rounded text-xs border border-border bg-background text-primary hover:bg-muted transition-colors cursor-pointer">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
                {isMobile && (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Show Preview
                  </button>
                )}
              </div>
            </div>

            <div
              className="flex-1 relative"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <textarea
                ref={textareaRef}
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
            {/* Inline image preview */}
            {imagePreview && (
              <div className="mt-4 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-40 rounded border border-border shadow"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}
          </motion.div>

          {/* Split Pane Divider */}
          <div
            className="w-2 cursor-col-resize bg-border hover:bg-primary/20 transition-colors z-10"
            style={{ touchAction: 'none', userSelect: 'none', display: isMobile ? 'none' : 'block' }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          />

          {/* Preview Section */}
          <motion.div
            className={`flex flex-col ${isMobile && showPreview ? 'hidden' : 'flex'}`}
            style={{ flex: `0 0 ${split}%`, minWidth: 0 }}
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
                    <div className="prose prose-sm sm:prose max-w-none">
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
                  },
                  img({src, alt, ...props}) {
                    // Replace placeholder with actual image data URL if available
                    const realSrc = imageMap[src] || src;
                    return (
                      <img
                        src={realSrc}
                        alt={alt}
                        {...props}
                        style={{ maxWidth: '100%', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                      />
                    );
                  }
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
