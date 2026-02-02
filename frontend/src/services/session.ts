export type Session = { id: string; username: string; name?: string; studentId?: string; defaultPath?: string };

export function getSession(): Session | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
