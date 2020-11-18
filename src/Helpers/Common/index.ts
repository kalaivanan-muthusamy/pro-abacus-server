export function ucFirst(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function isNumArrayEqual(source: Array<number>, target: Array<number>, sort = false): boolean {
  if (sort) {
    source = [...source].sort((a, b) => a - b);
    target = [...target].sort((a, b) => a - b);
  }

  if (source === target) return true;
  if (source == null || target == null) return false;
  if (source.length !== target.length) return false;

  for (let i = 0; i < source.length; ++i) {
    if (source[i] !== target[i]) return false;
  }
  return true;
}
