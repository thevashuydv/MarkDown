import { countWords, countCharacters, estimateReadingTime } from '@/lib/textUtils';

/**
 * Component that displays word count, character count, and estimated reading time
 */
export function WordCounter({ text }) {
  const wordCount = countWords(text);
  const charCount = countCharacters(text);
  const readingTime = estimateReadingTime(text);

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground bg-background/60 backdrop-blur-md p-3 rounded-md border border-border/50 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="font-semibold">{wordCount}</span>
        <span>words</span>
      </div>
      <div className="w-px h-4 bg-border/50" />
      <div className="flex items-center gap-1.5">
        <span className="font-semibold">{charCount}</span>
        <span>characters</span>
      </div>
      <div className="w-px h-4 bg-border/50" />
      <div className="flex items-center gap-1.5">
        <span className="font-semibold">{readingTime}</span>
        <span>min read</span>
      </div>
    </div>
  );
}
