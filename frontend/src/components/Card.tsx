import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export default function Card({ children, style }: any) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: 14,
    shadowColor: theme.shadowColor,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
    elevation: theme.elevation,
  },
});
