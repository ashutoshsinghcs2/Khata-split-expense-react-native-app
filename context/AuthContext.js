import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();
const SESSION_KEY = 'loggedInUserEmail';

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = still checking
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    (async () => {
      const email = await SecureStore.getItemAsync(SESSION_KEY);
      setUserEmail(email);
      setIsLoggedIn(!!email);
    })();
  }, []);

  const login = async (email) => {
    await SecureStore.setItemAsync(SESSION_KEY, email);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUserEmail(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);