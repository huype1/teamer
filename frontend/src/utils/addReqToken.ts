import { isTokenExpired } from "./jwt";

export default function addReqToken(token: string | null) {
  if (!token || isTokenExpired(token)) {
    if (token) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return undefined;
  }
  return { headers: { Authorization: `Bearer ${token}` } };
}