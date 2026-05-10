import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ nombre = 'Usuario' }: { nombre?: string }) {
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  const initials = (nombre || 'U').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={[styles.header, { paddingTop: (insets.top || 0) + 12 }] }>
      <View>
        <Text style={styles.greeting}>Hola, {nombre} <Text style={{fontSize:18}}>👋</Text></Text>
        <Text style={styles.subtitle}>Organiza tu día</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Usuarios', { showOnlyLogged: true })} style={styles.avatar} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }}>
        <Text style={styles.avatarText}>{initials}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: theme.primary, padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  avatar: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 22 },
  avatarText: { color: '#fff', fontWeight: '700' },
});
