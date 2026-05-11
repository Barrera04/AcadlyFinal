import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  icon?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  editable?: boolean;
  style?: any;
}

export default function Input({
  placeholder,
  value,
  onChangeText,
  label,
  error,
  icon,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  editable = true,
  style,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={style}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
            marginBottom: theme.spacing.sm,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.container,
          {
            borderColor: error
              ? theme.danger
              : focused
              ? theme.primary
              : theme.border,
            borderWidth: error ? 1.5 : 1,
            backgroundColor: editable ? theme.card : theme.bg,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={focused ? theme.primary : theme.textSecondary}
            style={{ marginRight: theme.spacing.md }}
          />
        )}
        <TextInput
          style={[
            styles.input,
            {
              flex: 1,
              color: theme.text,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: theme.danger,
            marginTop: theme.spacing.sm,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  input: {
    fontSize: 15,
    fontWeight: '500',
  },
});
