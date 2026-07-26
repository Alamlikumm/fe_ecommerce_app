export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${process.env.NEXT_PUBLIC_BACKEND_URL || ""}${path}`;
  return path;
}
