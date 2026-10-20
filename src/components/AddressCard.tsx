import { StyleSheet, Text, View } from 'react-native';

import type { NationalAddress } from '../lib/API';
import type { Strings } from '../i18n';
import { colors, radius, spacing } from '../theme';

interface Props {
  address: NationalAddress;
  t: Strings;
  rtl: boolean;
}

export const AddressCard = ({ address, t, rtl }: Props) => {
  const align = { textAlign: rtl ? 'right' : 'left' } as const;
  const fields: [string, string][] = [
    [t.buildingNumber, address.buildingNumber],
    [t.postCode, address.postCode],
    [t.additionalNumber, address.additionalNumber],
    [t.street, address.street],
    [t.district, address.district],
    [t.city, address.city],
    [t.region, address.region],
  ];

  return (
    <View style={styles.card}>
      <Text style={[styles.line1, align]}>{address.line1}</Text>
      {address.line2 ? <Text style={[styles.line2, align]}>{address.line2}</Text> : null}
      <View style={[styles.grid, rtl && styles.gridRtl]}>
        {fields
          .filter(([, value]) => value.length > 0)
          .map(([label, value]) => (
            <View key={label} style={styles.field}>
              <Text style={[styles.label, align]}>{label}</Text>
              <Text style={[styles.value, align]}>{value}</Text>
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  line1: { fontSize: 16, fontWeight: '600', color: colors.text },
  line2: { fontSize: 14, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, rowGap: spacing.sm },
  gridRtl: { flexDirection: 'row-reverse' },
  field: { width: '50%', paddingHorizontal: spacing.xs },
  label: { fontSize: 12, color: colors.muted },
  value: { fontSize: 14, color: colors.text, fontWeight: '500' },
});
