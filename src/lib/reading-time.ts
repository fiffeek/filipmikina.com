export function getReadingTime(content: string): {
  words: number;
  minutes: number;
} {
  const wordsPerMinute = 200;

  const text = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\n/g, " ");

  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const minutes = Math.ceil(words / wordsPerMinute);

  return { words, minutes };
}
