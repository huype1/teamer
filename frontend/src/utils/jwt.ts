import {jwtDecode} from "jwt-decode";

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const decoded: { exp: number } = jwtDecode(token);
    if (!decoded.exp) return true;
    // exp is in seconds, Date.now() in ms
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    console.error("Error decoding token:", e);
    return true;
  }
} 