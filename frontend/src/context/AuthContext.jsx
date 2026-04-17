import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("lastLoginTime");
  localStorage.removeItem("userType");
  localStorage.removeItem("profileComplete");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};

const syncSessionStorage = (session) => {
  if (!session?.access_token) {
    clearAuthStorage();
    return;
  }

  localStorage.setItem("accessToken", session.access_token);
  if (session.refresh_token) {
    localStorage.setItem("refreshToken", session.refresh_token);
  }
  localStorage.setItem("lastLoginTime", String(Date.now()));
  localStorage.setItem("userType", "user");
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!supabase) {
        if (isMounted) {
          clearAuthStorage();
          setIsLoggedIn(false);
          setUser(null);
        }
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error || !data?.session) {
        clearAuthStorage();
        setIsLoggedIn(false);
        setUser(null);
      } else {
        syncSessionStorage(data.session);
        setIsLoggedIn(true);
        setUser(data.session.user || null);
      }
    };

    bootstrap();

    const { data: authListener } = supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.access_token) {
            syncSessionStorage(session);
            setIsLoggedIn(true);
            setUser(session.user || null);
          } else {
            clearAuthStorage();
            setIsLoggedIn(false);
            setUser(null);
          }
        })
      : { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email, password) => {
    if (!supabase) {
      return { error: new Error("Supabase is not configured.") };
    }

    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.data?.session) {
      syncSessionStorage(result.data.session);
      setIsLoggedIn(true);
      setUser(result.data.session.user || null);
    }
    return result;
  };

  const signUpWithPassword = async ({
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    aadharNumber,
    password,
  }) => {
    if (!supabase) {
      return { error: new Error("Supabase is not configured.") };
    }

    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          address,
          aadhar_number: aadharNumber,
          emergency_contact1: "0000000000",
          emergency_contact2: "0000000000",
        },
      },
    });
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: new Error("Supabase is not configured.") };
    }

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
  };

  const login = async (email, password) => signInWithPassword(email, password);

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearAuthStorage();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
