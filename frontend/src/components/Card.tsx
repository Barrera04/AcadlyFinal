import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ children, style, variant = 'default', padding = 'md' }: CardProps) {
  const paddingValue = {
    sm: theme.spacing.md,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
  }[padding];

  const variantStyles = {
    default: [theme.shadows.md, { borderWidth: 0 }],
    elevated: [theme.shadows.lg, { borderWidth: 0 }],
    outlined: [
      theme.shadows.sm,
      {
        borderWidth: 1,
        borderColor: theme.border,
      },
    ],
  };

  return (
    <View
      style={[
        styles.card,
        { padding: paddingValue },
        variantStyles[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius.lg,
  },
});
