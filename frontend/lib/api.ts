const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

export async function createMeeting(data?: { title?: string; description?: string; scheduled_at?: string; duration_minutes?: number }) {
  return apiFetch("/meetings", {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}

export async function getMeeting(meetingId: string) {
  return apiFetch(`/meetings/${meetingId}`);
}

export async function getUpcomingMeetings() {
  return apiFetch("/meetings/upcoming/list");
}

export async function getRecentMeetings() {
  return apiFetch("/meetings/recent/list");
}

export async function joinMeeting(meetingId: string, displayName: string) {
  return apiFetch(`/meetings/${meetingId}/join`, {
    method: "POST",
    body: JSON.stringify({ display_name: displayName }),
  });
}

export async function endMeeting(meetingId: string) {
  return apiFetch(`/meetings/${meetingId}/end`, { method: "POST" });
}
