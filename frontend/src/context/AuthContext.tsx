import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import useFirebaseEmailVerification from '../hooks/useFirebaseEmailVerification';

type User = { id: number; nombre: string; email: string } | null;

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { checkWithCredentials } = useFirebaseEmailVerification();

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('user');
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    console.log('AuthContext.login response', res);
    // Backend may return either { token, user } or directly the user object.
    if (res?.token) {
      // Antes de guardar sesión, verificar email via Firebase
      try {
        const check = await checkWithCredentials(email, password);
        if (!check.verified) {
          return { success: false, needsVerification: true, error: 'Correo no verificado' };
        }
      } catch (e) {
        console.warn('[AuthContext] firebase check threw; treating as not verified', e);
        return { success: false, needsVerification: true, error: 'Correo no verificado' };
      }
      const userSafe = { ...res.user };
      if (userSafe.password) delete userSafe.password;
      await AsyncStorage.setItem('token', res.token);
      await AsyncStorage.setItem('user', JSON.stringify(userSafe));
      setToken(res.token);
      setUser(userSafe);
      return { success: true, user: userSafe };
    }
    if (res?.id || res?.email) {
      // treat direct user object as successful login (no token provided)
      // Also enforce verification check
      try {
        const check = await checkWithCredentials(email, password);
        if (!check.verified) {
          return { success: false, needsVerification: true, error: 'Correo no verificado' };
        }
      } catch (e) {
        console.warn('[AuthContext] firebase check threw; treating as not verified', e);
        return { success: false, needsVerification: true, error: 'Correo no verificado' };
      }
      const userSafe = { ...res };
      if (userSafe.password) delete userSafe.password;
      await AsyncStorage.removeItem('token');
      await AsyncStorage.setItem('user', JSON.stringify(userSafe));
      setToken(null);
      setUser(userSafe);
      return { success: true, user: userSafe };
    }
    console.warn('Login failed:', res);
    return { success: false, error: res?.error || 'Error de login' };
  };

  const register = async (nombre: string, email: string, password: string) => {
    const res = await authService.register({ nombre, email, password });
    if (res?.id) return { success: true, user: res };
    return { success: false, error: res?.error || 'Error al registrar' };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
