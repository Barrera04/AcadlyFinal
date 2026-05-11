import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const TAB_BAR_HEIGHT = 70;

interface FloatingButtonProps {
  onPress: () => void;
  children?: React.ReactNode;
  position?: 'center' | 'right';
  icon?: string;
}

export default function FloatingButton({
  onPress,
  children,
  position = 'center',
  icon = 'add',
}: FloatingButtonProps) {
  const insets = useSafeAreaInsets();
  const GAP_ABOVE_TAB = theme.spacing.lg;
  const bottom = (insets.bottom || 0) + TAB_BAR_HEIGHT + GAP_ABOVE_TAB - 22;
  const containerStyle =
    position === 'center' ? styles.containerCenter : styles.containerRight;
  const wrapperAlign = position === 'center' ? 'center' : 'flex-end';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom, alignItems: wrapperAlign } as any]}
    >
      <View style={containerStyle}>
        <TouchableOpacity
          onPress={onPress}
          style={styles.outer}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Agregar"
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View style={styles.inner}>
            {children ? (
              children
            ) : (
              <Ionicons name={icon as any} size={28} color="#fff" />
            )}
          </View>
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
    paddingHorizontal: theme.spacing.xl,
  },
  containerRight: { width: '100%', alignItems: 'flex-end', paddingRight: 0 },
  containerCenter: { width: '100%', alignItems: 'center' },
  outer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
});
