// utils.ts

export function hexToRgba(hex: string, opacity: number) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function formatSpeed(bytesPerSecond: number, decimals = 2) {
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes/s", "KB/s", "MB/s", "GB/s", "TB/s"];

  if (bytesPerSecond === 0) return "0 Bytes/s";

  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return (
    parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

export function formatBytes(bytes: any, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(dateString).toLocaleDateString(undefined, options);
}