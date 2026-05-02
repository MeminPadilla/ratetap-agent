import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../../constants/theme';
import { LeadStatus } from '../../types';

interface Props {
  counts: Record<LeadStatus, number>;
}

const STAGES: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'new',       label: 'New',       color: '#5B8DEF' },
  { status: 'qualified', label: 'Qualified', color: '#F59E0B' },
  { status: 'won',       label: 'Won',       color: '#34D399' },
  { status: 'lost',      label: 'Lost',      color: '#9098A4' },
];

export const LeadFunnel = ({ counts }: Props) => {
  const max = Math.max(1, ...STAGES.map((s) => counts[s.status]));
  const total = STAGES.reduce((s, st) => s + counts[st.status], 0);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Lead pipeline</Text>
        <Text style={styles.totalText}>{total} total</Text>
      </View>

      {total === 0 ? (
        <Text style={styles.empty}>No leads yet.</Text>
      ) : (
        STAGES.map((s) => {
          const count = counts[s.status];
          const pct = count / max;
          return (
            <View key={s.status} style={styles.row}>
              <Text style={styles.label}>{s.label}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.max(2, pct * 100)}%`,
                      backgroundColor: s.color,
                      opacity: count === 0 ? 0.25 : 1,
                    },
                  ]}
                />
              </View>
              <Text style={styles.count}>{count}</Text>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  totalText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontWeight: '600',
    width: 76,
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  count: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
  empty: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
