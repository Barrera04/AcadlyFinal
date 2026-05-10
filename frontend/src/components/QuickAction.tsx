import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';

export default function QuickAction({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.wrap} onPress={onPress} hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }} activeOpacity={0.8}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: theme.card,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: theme.radius,
    justifyContent: 'center',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.lightBlue,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontSize: 13, color: theme.text, fontWeight: '600' },
});
