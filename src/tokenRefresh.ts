export function isStillLogged() {
  const refreshToken = localStorage.getItem("refreshToken");

  return !!refreshToken;
}
