// Replace standard expo-secure-store with web storage patterns

export async function saveAuthToken(token: string): Promise<void> {
  try {
    localStorage.setItem("auth_token", token);
  } catch (error) {
    console.error("Failed to save AuthToken:", error);
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const token = localStorage.getItem("auth_token");
    return token;
  } catch (error) {
    console.error("Failed to retrieve AuthToken:", error);
    return null;
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    localStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Failed to clear AuthToken:", error);
  }
}

export async function saveRefreshToken(token: string): Promise<void> {
  try {
    localStorage.setItem("refresh_token", token);
  } catch (error) {
    console.error("Failed to save RefreshToken:", error);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const token = localStorage.getItem("refresh_token");
    return token;
  } catch (error) {
    console.error("Failed to retrieve RefreshToken:", error);
    return null;
  }
}

export async function clearRefreshToken(): Promise<void> {
  try {
    localStorage.removeItem("refresh_token");
  } catch (error) {
    console.error("Failed to clear RefreshToken:", error);
  }
}