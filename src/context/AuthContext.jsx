import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const name = localStorage.getItem('admin_name');
    const role = localStorage.getItem('admin_role');
    if (token && role === 'admin') {
      setUser({ token, name, role });
    }
    setLoading(false);
  }, []);

  const loginUser = (token, name, role) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_name', name);
    localStorage.setItem('admin_role', role);
    setUser({ token, name, role });
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
