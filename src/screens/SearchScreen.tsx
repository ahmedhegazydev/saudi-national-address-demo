import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AddressCard } from '../components/AddressCard';
import { StatusMessage } from '../components/StatusMessage';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Strings } from '../i18n';
import type { Language, NationalAddress, SearchResult } from '../lib/API';
import { nationalAddressService } from '../lib/services/NationalAddressService';
import { colors, radius, spacing } from '../theme';

interface Props {
  language: Language;
  t: Strings;
  rtl: boolean;
  onSelect: (address: NationalAddress) => void;
}

const MIN_CHARS = 3;
// Long debounce on purpose: the Starter plan only allows 5 calls a minute.
const DEBOUNCE_MS = 800;

export const SearchScreen = ({ language, t, rtl, onSelect }: Props) => {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (debounced.length < MIN_CHARS) {
      setResult(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    nationalAddressService
      .search(debounced, language)
      .then(data => !cancelled && setResult(data))
      .catch(e => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced, language]);

  const hint = () => {
    if (debounced.length < MIN_CHARS) return t.searchHint;
    if (!result) return undefined;
    return result.addresses.length ? `${result.total} ${t.results}` : t.noResults;
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { textAlign: rtl ? 'right' : 'left' }]}
        value={query}
        onChangeText={setQuery}
        placeholder={t.searchPlaceholder}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <StatusMessage t={t} loading={loading} error={error} message={hint()} />
      <FlatList
        data={loading || error ? [] : result?.addresses ?? []}
        keyExtractor={(item, index) => `${item.buildingNumber}-${item.postCode}-${index}`}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable onPress={() => onSelect(item)} disabled={!item.coordinate}>
            <AddressCard address={item} t={t} rtl={rtl} />
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
});
