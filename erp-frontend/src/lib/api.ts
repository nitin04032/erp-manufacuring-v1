// erp-frontend/lib/api.ts
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!res.ok) {
    let error: any;
    try {
      error = await res.json();
    } catch {
      error = { error: "Server error" };
    }
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}
