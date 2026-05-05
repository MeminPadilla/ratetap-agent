import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

interface Props {
  children: ReactNode;
  padded?: boolean;
  style?: ViewStyle;
}

export const ScreenContainer = ({ children, padded = true, style }: Props) => (
  <SafeAreaView edges={['top']} style={styles.safe}>
    <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});
