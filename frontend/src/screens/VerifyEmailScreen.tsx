import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Card from '../components/Card';
import { theme } from '../styles/theme';
import useFirebaseEmailVerification from '../hooks/useFirebaseEmailVerification';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../firebase';
import { showMessage } from '../utils/notify';

interface Props {
  navigation?: any;
  route?: any;
}

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { loading, resendVerification, checkEmailVerified, signOutFirebase, isVerifiedInStorage } = useFirebaseEmailVerification();
  const [checking, setChecking] = useState(false);
  const [resent, setResent] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  const email = route?.params?.email || auth.currentUser?.email || '';

  useEffect(() => {
    (async () => {
      if (email) {
        const stored = await isVerifiedInStorage(email);
        if (stored) setVerified(true);
      }
    })();
  }, [email]);

  const handleResend = async () => {
    const res = await resendVerification();
    if (res.success) {
      setResent(true);
    } else {
      showMessage('Error', res.error || 'No se pudo reenviar');
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    const res = await checkEmailVerified();
    setChecking(false);
    if (res.success) {
      if (res.verified) {
        setVerified(true);
        showMessage('Éxito', 'Correo verificado');
        await signOutFirebase();
        // opcional: navigation.goBack() si quieres volver
        if (navigation && navigation.goBack) navigation.goBack();
      } else {
        setVerified(false);
        showMessage('Info', 'Aún no se ha verificado el correo');
      }
    } else {
      showMessage('Error', res.error || 'Error al verificar');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }] }>
      <Card style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={48} color={theme.primary} />
        </View>
        <Text style={styles.title}>Revisa tu correo electrónico</Text>
        <Text style={styles.subtitle}>Hemos enviado un enlace de verificación a</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={{ height: 12 }} />

        <Button label="Ya verifiqué" onPress={handleCheck} fullWidth />

        <View style={{ height: 12 }} />

        <Button label={resent ? 'Reenviado' : 'Reenviar correo'} onPress={handleResend} variant="outline" fullWidth disabled={resent || loading} />

        <View style={{ height: 16 }} />

        {checking && <ActivityIndicator color={theme.primary} />}

        {verified === true && <Text style={styles.verified}>Correo verificado ✅</Text>}
        {verified === false && <Text style={styles.notVerified}>Aún no verificado</Text>}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 16 },
  card: { marginTop: 40, padding: 24, alignItems: 'center' },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center', marginBottom: 16, ...theme.shadows.sm },
  title: { fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center' },
  email: { marginTop: 8, fontSize: 16, fontWeight: '600', color: theme.text, textAlign: 'center' },
  verified: { marginTop: 12, color: theme.success, fontWeight: '700' },
  notVerified: { marginTop: 12, color: theme.warning, fontWeight: '700' },
});
