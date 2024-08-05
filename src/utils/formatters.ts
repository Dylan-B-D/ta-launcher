export function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  else if (size < 1024 * 1024 * 1024)
    return `${(size / 1024 / 1024).toFixed(0)} MB`;
  else return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export const formatTime = (seconds: number) => {
  if (seconds < 60) return `${Math.floor(seconds)} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  return `${Math.floor(seconds / 3600)} hours`;
};
