import { createContext, useContext, useState } from "react";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Simulated Login Logic
  const login = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({ email, uid: 'simulated-user' });
        resolve();
      }, 800);
    });
  };

  const signup = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({ email, uid: 'simulated-user' });
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const resetPassword = async (email) => {
    return new Promise((resolve) => setTimeout(resolve, 800));
  };

  const loginWithGoogle = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({ email: 'google@test.com', uid: 'google-user' });
        resolve();
      }, 800);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, resetPassword, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
