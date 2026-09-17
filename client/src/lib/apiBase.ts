const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

/**
 * Browser requests stay same-origin . The itch.io build can be
 * pointed at the published app at build time with VITE_API_BASE_URL.
 */
export function apiUrl(path: string): string {
  if (!configuredApiBase) return path;
  return `${configuredApiBase.replace(/\/+$/, "")}${path}`;
}

export const apiBaseUrl = configuredApiBase;