import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  nombre?: string;
  subtitle?: string;
  showAvatar?: boolean;
}

export default function Header({
  nombre = 'Usuario',
  subtitle = 'Organiza tu día',
  showAvatar = true,
}: HeaderProps) {
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  const initials = (nombre || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: (insets.top || 0) + theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
        },
      ]}
    >
      <View>
        <Text style={styles.greeting}>
          {greeting}, {nombre}
          <Text style={{ fontSize: 20 }}>👋</Text>
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {showAvatar && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Usuarios', { showOnlyLogged: true })
          }
          style={styles.avatar}
          hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarText}>{initials}</Text>
          <View style={styles.avatarBadge}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.primary,
    paddingHorizontal: theme.spacing.xl,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...theme.shadows.md,
  },
  greeting: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: theme.spacing.sm,
    fontSize: 15,
    fontWeight: '500',
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    backgroundColor: theme.success,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.card,
  },
});
