export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function truncate(text: string, max = 160): string {
  if (!text) return "";
  const stripped = text.replace(/\s+/g, " ").trim();
  return stripped.length > max ? `${stripped.slice(0, max).trim()}…` : stripped;
}

/** Гарантирует, что ссылка на плеер имеет протокол https:// (используется на клиенте) */
export function normalizePlayerLink(link: string): string {
  if (link.startsWith("//")) return `https:${link}`;
  if (link.startsWith("http")) return link;
  return `https://${link}`;
}
