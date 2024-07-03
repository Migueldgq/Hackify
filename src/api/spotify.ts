import { generateCodeChallenge, generateCodeVerifier } from "../utils";

const apiAccount = "https://accounts.spotify.com";
const api = "https://api.spotify.com";

export async function redirectToProvider(): Promise<void> {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", import.meta.env.VITE_CLIENTID);
  params.append("response_type", "code");
  params.append("redirect_uri", import.meta.env.VITE_URI_CALLBACK);
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `${apiAccount}/authorize?${params.toString()}`;
}

export async function getTokens(code: string): Promise<TokenResponse> {
  const verifier = localStorage.getItem("verifier");
  if (!verifier) {
    throw new Error("Code verifier not found");
  }
  const params = new URLSearchParams();

  params.append("client_id", import.meta.env.VITE_CLIENTID);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", import.meta.env.VITE_URI_CALLBACK);
  params.append("code_verifier", verifier!);

  const result = await fetch(`${apiAccount}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token, refresh_token } = await result.json();
  return {
    access_token,
    refresh_token,
  };
}

export async function getProfile(token: string): Promise<UserProfile> {
  const result = await fetch(`${api}/v1/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

export async function getMyPlaylists(token: string): Promise<PlaylistRequest> {
  const result = await fetch(`${api}/v1/me/playlists`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

export async function getPlaylist(
  token: string,
  playlistId: string
): Promise<PlaylistSong> {
  const result = await fetch(`${api}/v1/playlists/${playlistId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await result.json();
  console.log(data);
  return data;
}

// TODO agregar nuevas funciones para obtener playlists, canciones, etc
