import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../constants/theme';

interface Props {
  onPress: () => void;
  label?: string;
}

export const FAB = ({ onPress, label = '+' }: Props) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    accessibilityRole="button"
    accessibilityLabel="Add"
  >
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  label: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 34,
  },
});
