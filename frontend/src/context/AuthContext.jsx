import { createContext, useEffect, useState } from "react";
import { getMe, login as loginRequest, logout as logoutRequest, signup as signupRequest, updateProfile } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => ({ user: null, ready: false }));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMe()
      .then(({ user }) => {
        setAuth({ user, ready: true });
      })
      .catch(() => {
        setAuth({ user: null, ready: true });
      });
  }, []);

  async function performAuth(action, payload) {
    setLoading(true);
    setError("");

    try {
      const result = await action(payload);
      setAuth({ user: result.user, ready: true });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function login(payload) {
    return performAuth(loginRequest, payload);
  }

  async function signup(payload) {
    return performAuth(signupRequest, payload);
  }

  async function saveProfile(payload) {
    setLoading(true);
    setError("");

    try {
      const result = await updateProfile(payload);
      setAuth((current) => ({ ...current, user: result.user }));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // Clear local auth even if the network request fails.
    }

    setAuth({ user: null, ready: true });
  }

  const value = {
    auth,
    error,
    loading,
    login,
    signup,
    saveProfile,
    logout,
    clearError: () => setError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
