export async function api<T>(path: string): Promise<T> {
  const useMocks = process.env.NEXT_PUBLIC_API_BASE === "" || process.env.USE_MOCKS === "true";
  if (useMocks) {
    // Hit Next.js route (local mock)
    const res = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL ? "" : ""}/api${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  } else {
    const base = process.env.NEXT_PUBLIC_API_BASE || "";
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  }
}
