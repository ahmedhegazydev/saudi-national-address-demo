import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { StatusMessage } from '../components/StatusMessage';
import type { Strings } from '../i18n';
import type { Language, VerifyParams } from '../lib/API';
import { nationalAddressService } from '../lib/services/NationalAddressService';
import { colors, radius, spacing } from '../theme';

interface Props {
  language: Language;
  t: Strings;
  rtl: boolean;
}

// Pre-filled with the sample address from the official docs.
const SAMPLE: VerifyParams = { buildingNumber: '8228', zipCode: '12643', additionalNumber: '2121' };

const isValid = ({ buildingNumber, zipCode, additionalNumber }: VerifyParams) =>
  /^\d{4}$/.test(buildingNumber) && /^\d{5}$/.test(zipCode) && /^\d{4}$/.test(additionalNumber);

export const VerifyScreen = ({ language, t, rtl }: Props) => {
  const [form, setForm] = useState<VerifyParams>(SAMPLE);
  const [found, setFound] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fields: { key: keyof VerifyParams; label: string; maxLength: number }[] = [
    { key: 'buildingNumber', label: t.buildingNumber, maxLength: 4 },
    { key: 'zipCode', label: t.zipCode, maxLength: 5 },
    { key: 'additionalNumber', label: t.additionalNumber, maxLength: 4 },
  ];

  const update = (key: keyof VerifyParams, value: string) => {
    setForm(prev => ({ ...prev, [key]: value.replace(/\D/g, '') }));
    setFound(null);
  };

  const onVerify = async () => {
    setLoading(true);
    setError(null);
    setFound(null);
    try {
      setFound(await nationalAddressService.verify(form, language));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const valid = isValid(form);
  const align = { textAlign: rtl ? 'right' : 'left' } as const;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {fields.map(({ key, label, maxLength }) => (
        <View key={key} style={styles.field}>
          <Text style={[styles.label, align]}>{label}</Text>
          <TextInput
            style={[styles.input, align]}
            value={form[key]}
            onChangeText={value => update(key, value)}
            keyboardType="number-pad"
            maxLength={maxLength}
          />
        </View>
      ))}
      {!valid ? <Text style={[styles.invalid, align]}>{t.invalidInput}</Text> : null}
      <Pressable
        style={[styles.button, (!valid || loading) && styles.buttonDisabled]}
        disabled={!valid || loading}
        onPress={onVerify}
      >
        <Text style={styles.buttonText}>{t.verify}</Text>
      </Pressable>
      <StatusMessage t={t} loading={loading} error={error} />
      {found !== null ? (
        <Text style={[styles.result, { color: found ? colors.success : colors.danger }]}>
          {found ? t.verified : t.notVerified}
        </Text>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  field: { gap: spacing.xs },
  label: { fontSize: 13, color: colors.muted },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.text,
  },
  invalid: { color: colors.warning, fontSize: 13 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  result: { textAlign: 'center', fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
});
