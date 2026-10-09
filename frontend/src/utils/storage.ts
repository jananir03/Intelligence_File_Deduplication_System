export const getAccessToken = (): string | null =>
  localStorage.getItem("access_token");

export const clearAuthStorage = (): void => {
  localStorage.removeItem("access_token");
};