import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from '../utils/notify';
import { theme } from '../styles/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation: any = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await login(email, password);
      if (res?.success) {
        showMessage('Éxito', 'Has iniciado sesión');
        setLoading(false);
        return;
      }
      if (res?.needsVerification) {
        showMessage('Info', 'Debes verificar tu correo antes de iniciar sesión');
        setLoading(false);
        navigation.navigate('VerifyEmail', { email });
        return;
      }
      const err = res?.error || 'Credenciales inválidas';
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
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
            <Text style={{ color: '#6b7280' }}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fb' },
  card: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 6 },
  title: { fontSize: 28, fontWeight: '700', color: '#0b2545', marginBottom: 4 },
  subtitle: { color: '#6b7280', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e6edf5', padding: 12, borderRadius: 10, marginTop: 8 },
  button: { marginTop: 16, backgroundColor: theme.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#dc2626', marginBottom: 8 },
});
