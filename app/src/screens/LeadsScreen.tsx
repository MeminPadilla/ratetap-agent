import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FAB } from '../components/FAB';
import { ListRow } from '../components/ListRow';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, fontSize, formatMoney, radius, spacing } from '../constants/theme';
import { useStore } from '../storage/useStore';
import { LeadStatus } from '../types';
import type { LeadsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<LeadsStackParamList, 'LeadsList'>;

const STATUS_META: Record<LeadStatus, { label: string; color: string; emoji: string }> = {
  new:       { label: 'New',       color: '#5B8DEF', emoji: '✨' },
  qualified: { label: 'Qualified', color: '#F59E0B', emoji: '🎯' },
  won:       { label: 'Won',       color: '#34D399', emoji: '🏆' },
  lost:      { label: 'Lost',      color: '#9098A4', emoji: '💤' },
};

const STATUS_ORDER: LeadStatus[] = ['new', 'qualified', 'won', 'lost'];

export const LeadsScreen = () => {
  const { leads } = useStore();
  const nav = useNavigation<Nav>();

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: leads.filter((l) => l.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <ScreenContainer>
      <Text style={styles.title}>SaaS Leads</Text>
      {leads.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No leads yet</Text>
          <Text style={styles.emptyHint}>Tap + to add your first lead.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {grouped.map((group) => {
            const meta = STATUS_META[group.status];
            return (
              <View key={group.status} style={styles.group}>
                <View style={styles.groupHead}>
                  <Text style={[styles.groupLabel, { color: meta.color }]}>
                    {meta.label}
                  </Text>
                  <Text style={styles.groupCount}>{group.items.length}</Text>
                </View>
                {group.items.map((lead) => (
                  <ListRow
                    key={lead.id}
                    leading={{ color: meta.color, emoji: meta.emoji }}
                    title={lead.name}
                    subtitle={lead.contact || lead.note || meta.label}
                    amount={lead.mrr ? `${formatMoney(lead.mrr)}/mo` : undefined}
                    amountColor={meta.color}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
      <FAB onPress={() => nav.navigate('AddLead')} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  group: {
    marginBottom: spacing.lg,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  groupLabel: {
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  groupCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  emptyHint: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
