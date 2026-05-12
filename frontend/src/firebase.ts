// Firebase initialization (fill with your project's config)
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// initializeAuth and getReactNativePersistence are conditionally required at runtime
// because Metro may fail to resolve the react-native entry in some environments.
let initializeAuth: any = null;
let getReactNativePersistence: any = null;
let createAsyncStorage: any = null;
try {
  // require at runtime to avoid Metro static resolution errors
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rnAuth = require('firebase/auth/react-native');
  initializeAuth = rnAuth.initializeAuth;
  getReactNativePersistence = rnAuth.getReactNativePersistence;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createAsyncStorage = require('@react-native-async-storage/async-storage').createAsyncStorage;
} catch (e) {
  // will fallback to getAuth below
  // console.warn will be logged later when attempting to use these
}

// TODO: reemplaza estos valores con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCwTYibUSqOzhEcic5hFHZZCCDNI37GDZs",
  authDomain: "acadlyapp.firebaseapp.com",
  projectId: "acadlyapp",
  storageBucket: "acadlyapp.firebasestorage.app",
  messagingSenderId: "861903289191",
  appId: "1:861903289191:web:31fd12aa1017cf37048dc2"
};

// Inicializar solo si no hay apps
let app: any;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let auth: any;
if (initializeAuth && getReactNativePersistence && createAsyncStorage) {
  try {
    const appStorage = createAsyncStorage('app');
    const persistence = getReactNativePersistence(appStorage);
    auth = initializeAuth(app, { persistence });
  } catch (e) {
    console.warn('[firebase] initializeAuth failed, falling back to getAuth', e);
    auth = getAuth(app);
  }
} else {
  console.warn('[firebase] react-native auth persistence not available, using getAuth fallback');
  auth = getAuth(app);
}

export { auth };
export default auth;
