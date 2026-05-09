import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { showMessage } from '../utils/notify';

export default function RegisterScreen() {
  const { register, login } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await register(nombre, email, password);
      if (res?.success) {
        showMessage('Éxito', 'Cuenta creada correctamente');
        // auto-login after register
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
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
        </TouchableOpacity>
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
