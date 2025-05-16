/**
 * Counts the number of words in a text string
 * @param {string} text - The text to count words in
 * @returns {number} The word count
 */
export function countWords(text) {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Counts the number of characters in a text string
 * @param {string} text - The text to count characters in
 * @returns {number} The character count
 */
export function countCharacters(text) {
  if (!text) return 0;
  return text.length;
}

/**
 * Estimates the reading time of a text in minutes
 * @param {string} text - The text to estimate reading time for
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {number} Estimated reading time in minutes
 */
export function estimateReadingTime(text, wordsPerMinute = 200) {
  const words = countWords(text);
  return Math.ceil(words / wordsPerMinute);
}
