import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

export default function QuickAction({ icon, label, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={onPress}
      hitSlop={{ top: 28, bottom: 28, left: 28, right: 28 }}
      activeOpacity={0.7}
    >
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.card,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    marginHorizontal: theme.spacing.sm,
    ...theme.shadows.md,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.lightBlue,
    marginBottom: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});
