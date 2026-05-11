import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export default function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const sizes = {
    sm: { padding: 8, fontSize: 13 },
    md: { padding: 12, fontSize: 15 },
    lg: { padding: 14, fontSize: 16 },
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.primary,
      borderWidth: 0,
      color: '#fff',
    },
    secondary: {
      backgroundColor: theme.primaryLight,
      borderWidth: 0,
      color: theme.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.primary,
      color: theme.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      color: theme.text,
    },
    danger: {
      backgroundColor: theme.danger,
      borderWidth: 0,
      color: '#fff',
    },
  };

  const current = variantStyles[variant];
  const sizeConfig = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          padding: sizeConfig.padding,
          backgroundColor: disabled ? theme.muted : current.backgroundColor,
          borderWidth: current.borderWidth,
          borderColor: current.borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading ? (
          <ActivityIndicator color={current.color} size="small" />
        ) : icon ? (
          <Ionicons name={icon as any} size={sizeConfig.fontSize + 2} color={current.color} />
        ) : null}
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
