import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { useStore } from '../storage/useStore';
import { LeadStatus } from '../types';

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new',       label: 'New',       color: '#5B8DEF' },
  { value: 'qualified', label: 'Qualified', color: '#F59E0B' },
  { value: 'won',       label: 'Won',       color: '#34D399' },
  { value: 'lost',      label: 'Lost',      color: '#5E6672' },
];

export const AddLeadScreen = () => {
  const nav = useNavigation();
  const { addLead } = useStore();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [mrrText, setMrrText] = useState('');
  const [note, setNote] = useState('');

  const mrr = parseFloat(mrrText || '0');
  const canSave = name.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    addLead({
      name: name.trim(),
      contact: contact.trim() || undefined,
      status,
      mrr: !isNaN(mrr) && mrr > 0 ? mrr : undefined,
      note: note.trim() || undefined,
    });
    nav.goBack();
  };

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>New SaaS lead</Text>

          <Field
            label="Name"
            placeholder="Acme Corp"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />
          <Field
            label="Contact (optional)"
            placeholder="email or phone"
            value={contact}
            onChangeText={setContact}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((opt) => {
              const active = status === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setStatus(opt.value)}
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: active ? opt.color : colors.surface,
                      borderColor: active ? opt.color : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusLabel,
                      { color: active ? '#fff' : colors.textDim },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ height: spacing.lg }} />

          <Field
            label="MRR estimate (optional)"
            placeholder="$ per month"
            value={mrrText}
            onChangeText={(t) => setMrrText(t.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            returnKeyType="next"
          />
          <Field
            label="Note (optional)"
            placeholder="Anything to remember…"
            value={note}
            onChangeText={setNote}
            returnKeyType="done"
            multiline
          />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Save lead" onPress={onSave} disabled={!canSave} />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusPill: {
    flexGrow: 1,
    flexBasis: '47%',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
