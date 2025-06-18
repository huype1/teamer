export default function addReqToken(token: string | null) {
  if (!token) {
    return undefined;
  }
  return { headers: { Authorization: `Bearer ${token}` } };
}
