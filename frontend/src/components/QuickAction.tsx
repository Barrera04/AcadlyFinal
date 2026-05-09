import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function QuickAction({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.wrap} onPress={onPress}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '30%', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  icon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#eef6ff', marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13, color: '#394b57' },
});
