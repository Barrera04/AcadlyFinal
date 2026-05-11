import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export default function Badge({
  label,
  variant = 'primary',
  size = 'md',
  style,
}: BadgeProps) {
  const variants = {
    primary: {
      backgroundColor: theme.lightBlue,
      color: theme.primary,
    },
    success: {
      backgroundColor: theme.successLight,
      color: theme.success,
    },
    danger: {
      backgroundColor: theme.dangerLight,
      color: theme.danger,
    },
    warning: {
      backgroundColor: '#fef3c7',
      color: theme.accent,
    },
    info: {
      backgroundColor: '#dbeafe',
      color: '#0369a1',
    },
  };

  const sizes = {
    sm: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 },
    md: { paddingHorizontal: 10, paddingVertical: 6, fontSize: 13 },
    lg: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  };

  const current = variants[variant];
  const sizeConfig = sizes[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: current.backgroundColor,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          paddingVertical: sizeConfig.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: current.color,
          fontSize: sizeConfig.fontSize,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
});
