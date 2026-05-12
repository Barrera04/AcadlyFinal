import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  reload,
  User,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { showMessage } from '../utils/notify';

const STORAGE_KEY = 'firebase_email_verified_v1';

export const useFirebaseEmailVerification = () => {
  const [loading, setLoading] = useState(false);

  const createTempUserAndSendVerification = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const uc = await createUserWithEmailAndPassword(auth, email, password);
      const user = uc.user;
      // enviar email de verificación
      await sendEmailVerification(user);
      showMessage('Éxito', 'Correo de verificación enviado');
      return { success: true, user };
    } catch (e: any) {
      console.error('[useFirebaseEmailVerification] create error:', e);
      return { success: false, error: e.message || String(e) };
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: 'No Firebase user present' };
      await sendEmailVerification(user as User);
      showMessage('Éxito', 'Correo reenviado');
      return { success: true };
    } catch (e: any) {
      console.error('[useFirebaseEmailVerification] resend error:', e);
      return { success: false, error: e.message || String(e) };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkWithCredentials = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // sign in temporarily to obtain user and check emailVerified
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      await reload(user as User);
      const verified = !!(user && user.emailVerified);
      // immediately sign out to avoid using Firebase for session
      await signOut(auth);
      if (verified) {
        await AsyncStorage.setItem(`${STORAGE_KEY}:${email}`, '1');
      }
      return { success: true, verified };
    } catch (e: any) {
      console.error('[useFirebaseEmailVerification] checkWithCredentials error:', e);
      try { await signOut(auth); } catch (er) {}
      return { success: false, verified: false, error: e.message || String(e) };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkEmailVerified = useCallback(async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, verified: false, error: 'No Firebase user present' };
      await reload(user as User);
      const verified = !!(auth.currentUser && auth.currentUser.emailVerified);
      if (verified) {
        // guardar estado local por si el usuario cierra la app
        await AsyncStorage.setItem(`${STORAGE_KEY}:${auth.currentUser?.email}`, '1');
      }
      return { success: true, verified };
    } catch (e: any) {
      console.error('[useFirebaseEmailVerification] check error:', e);
      return { success: false, verified: false, error: e.message || String(e) };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutFirebase = useCallback(async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  }, []);

  const isVerifiedInStorage = useCallback(async (email?: string) => {
    if (!email) return false;
    try {
      const v = await AsyncStorage.getItem(`${STORAGE_KEY}:${email}`);
      return v === '1';
    } catch (e) {
      return false;
    }
  }, []);

  return {
    loading,
    createTempUserAndSendVerification,
    resendVerification,
    checkEmailVerified,
    checkWithCredentials,
    signOutFirebase,
    isVerifiedInStorage,
  };
};

export default useFirebaseEmailVerification;
