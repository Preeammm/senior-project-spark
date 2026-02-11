export type ProfilePayload = {
  contactNumber: string;
  address: string;
  linkedinUrl: string;
  githubUrl: string;
};

function getUserId(): string {
  const raw = localStorage.getItem("spark_session");
  if (!raw) return "";
  try {
    const session = JSON.parse(raw);
    return session?.id ?? "";
  } catch {
    return "";
  }
}

export async function getMyProfile(): Promise<ProfilePayload> {
  const userId = getUserId();
  const res = await fetch("/api/me/profile", {
    headers: { "x-user-id": userId },
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function updateMyProfile(payload: ProfilePayload): Promise<ProfilePayload> {
  const userId = getUserId();
  const res = await fetch("/api/me/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}
