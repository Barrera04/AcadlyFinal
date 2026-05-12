import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import useFirebaseEmailVerification from '../hooks/useFirebaseEmailVerification';
import { showMessage } from '../utils/notify';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const { register, login } = useAuth();
  const navigation: any = useNavigation();
  const { createTempUserAndSendVerification } = useFirebaseEmailVerification();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid = password.length >= 8;

  const handleRegister = async () => {
    setError(null);
    // validate password length
    if (!passwordValid) {
      const msg = 'La contraseña debe tener al menos 8 caracteres';
      setError(msg);
      showMessage('Error', msg);
      return;
    }
    // validate passwords match before sending
    if (password !== confirmPassword) {
      const msg = 'Las contraseñas no coinciden';
      setError(msg);
      showMessage('Error', msg);
      return;
    }

    setLoading(true);
    try {
      const res: any = await register(nombre, email, password);
      if (res?.success) {
        showMessage('Éxito', 'Cuenta creada correctamente');
        // Crear usuario temporal en Firebase y enviar verificación
        try {
          const fb = await createTempUserAndSendVerification(email, password);
          if (fb?.success) {
            // Navegar a pantalla de verificación
            navigation.navigate('VerifyEmail', { email });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('[Register] firebase create/send failed', e);
        }
        // fallback: auto-login after register
        try {
          await login(email, password);
        } catch (e) {
          // fallback: do nothing
        }
        setLoading(false);
        return;
      }
      const err = res?.error || 'Error al registrar';
      setError(err);
      showMessage('Error', err);
    } catch (e) {
      const msg = 'Error de red';
      setError(msg);
      showMessage('Error', msg);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear cuenta</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={(t) => { setError(null); setPassword(t); }} />
        {!passwordValid && password ? <Text style={styles.error}>La contraseña debe tener al menos 8 caracteres</Text> : null}
        <TextInput style={styles.input} placeholder="Confirmar contraseña" secureTextEntry value={confirmPassword} onChangeText={(t) => { setError(null); setConfirmPassword(t); }} />
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading || !nombre || !email || !password || !confirmPassword || password !== confirmPassword}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
          <Text style={{ color: '#6b7280' }}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: '#3b82f6', fontWeight: '700' }}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fb' },
  card: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 6 },
  title: { fontSize: 22, fontWeight: '700', color: '#0b2545', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e6edf5', padding: 12, borderRadius: 10, marginTop: 8 },
  button: { marginTop: 16, backgroundColor: '#3b82f6', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#dc2626', marginBottom: 8 },
});
