export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const safeIndex = Math.min(index, units.length - 1);
  const value = bytes / Math.pow(1024, safeIndex);

  if (safeIndex === 0) {
    return `${Math.round(value)} ${units[safeIndex]}`;
  }

  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[safeIndex]}`;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getFileExtension(filename: string, extension?: string | null): string {
  if (extension) {
    return extension.replace(".", "").toUpperCase();
  }

  const lastDot = filename.lastIndexOf(".");
  return lastDot > -1 ? filename.slice(lastDot + 1).toUpperCase() : "FILE";
}
