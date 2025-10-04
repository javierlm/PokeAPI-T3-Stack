import { cookies } from "next/headers";

export async function getLocaleFromCookie() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  return localeCookie?.value === "en" ? "en" : "es";
}
