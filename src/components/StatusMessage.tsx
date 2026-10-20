import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { NationalAddressError } from '../lib/API';
import type { Strings } from '../i18n';
import { colors, spacing } from '../theme';

export const describeError = (error: unknown, t: Strings): string => {
  if (error instanceof NationalAddressError) {
    const base = t.errors[error.code];
    return error.code === 'RATE_LIMITED' && error.message !== error.code ? `${base} (${error.message})` : base;
  }
  return t.errors.UNKNOWN;
};

interface Props {
  loading?: boolean;
  error?: unknown;
  message?: string;
  t: Strings;
}

export const StatusMessage = ({ loading, error, message, t }: Props) => {
  if (loading) {
    return (
      <View style={styles.row}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.text}>{t.loading}</Text>
      </View>
    );
  }
  if (error) {
    return <Text style={[styles.text, styles.error]}>{describeError(error, t)}</Text>;
  }
  return message ? <Text style={styles.text}>{message}</Text> : null;
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  text: { textAlign: 'center', color: colors.muted, fontSize: 14, paddingVertical: spacing.sm },
  error: { color: colors.danger },
});
