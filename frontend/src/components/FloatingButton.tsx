import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';

const TAB_BAR_HEIGHT = 70;

export default function FloatingButton({ onPress, children, position = 'center' }: any) {
  const insets = useSafeAreaInsets();
  // position the FAB so its circular center sits a few pixels above the tab bar
  // formula derived so the inner 56px circle's bottom is ~8px above the tab bar
  const GAP_ABOVE_TAB = 8; // px between FAB bottom and tab bar top
  const bottom = (insets.bottom || 0) + TAB_BAR_HEIGHT + GAP_ABOVE_TAB - 22; // -22 accounts for outer/inner centering
  const containerStyle = position === 'center' ? styles.containerCenter : styles.containerRight;
  const wrapperAlign = position === 'center' ? 'center' : 'flex-end';

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom, alignItems: wrapperAlign } as any]}> 
      <View style={containerStyle}>
        <TouchableOpacity onPress={onPress} style={styles.outer} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel="Agregar" hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <View style={styles.inner}>{children || <Text style={styles.plus}>+</Text>}</View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 20,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  containerRight: { width: '100%', alignItems: 'flex-end', paddingRight: 16 },
  containerCenter: { width: '100%', alignItems: 'center' },
  outer: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  inner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadowColor,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: theme.shadowRadius,
    elevation: 10,
  },
  plus: { color: '#fff', fontSize: 30, fontWeight: '700' },
});
