import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { strings } from './src/i18n';
import type { Language, NationalAddress } from './src/lib/API';
import { IS_MOCK } from './src/lib/config';
import { MapScreen } from './src/screens/MapScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { VerifyScreen } from './src/screens/VerifyScreen';
import { colors, radius, spacing } from './src/theme';

type Tab = 'map' | 'search' | 'verify';

export default function App() {
  const [language, setLanguage] = useState<Language>('A');
  const [tab, setTab] = useState<Tab>('map');
  const [focus, setFocus] = useState<NationalAddress | null>(null);

  const t = strings[language];
  const rtl = language === 'A';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'map', label: t.tabMap },
    { key: 'search', label: t.tabSearch },
    { key: 'verify', label: t.tabVerify },
  ];

  const onSelectAddress = (address: NationalAddress) => {
    setFocus(address);
    setTab('map');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={[styles.header, rtl && styles.rowReverse]}>
          <Text style={styles.title}>{t.appTitle}</Text>
          {IS_MOCK ? <Text style={styles.badge}>{t.mock}</Text> : null}
          <View style={styles.spacer} />
          <Pressable style={styles.langButton} onPress={() => setLanguage(rtl ? 'E' : 'A')}>
            <Text style={styles.langText}>{rtl ? 'EN' : 'عربي'}</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          {/* Keep the map mounted so its position survives tab switches. */}
          <View style={[styles.fill, tab !== 'map' && styles.hidden]}>
            <MapScreen language={language} t={t} rtl={rtl} focus={focus} />
          </View>
          {tab === 'search' ? <SearchScreen language={language} t={t} rtl={rtl} onSelect={onSelectAddress} /> : null}
          {tab === 'verify' ? <VerifyScreen language={language} t={t} rtl={rtl} /> : null}
        </View>

        <View style={[styles.tabBar, rtl && styles.rowReverse]}>
          {tabs.map(({ key, label }) => (
            <Pressable key={key} style={styles.tab} onPress={() => setTab(key)}>
              <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  title: { color: colors.primaryText, fontSize: 18, fontWeight: '700' },
  badge: {
    backgroundColor: colors.warning,
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  spacer: { flex: 1 },
  langButton: {
    borderWidth: 1,
    borderColor: colors.primaryText,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  langText: { color: colors.primaryText, fontWeight: '600' },
  body: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  hidden: { display: 'none' },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  tabText: { color: colors.muted, fontSize: 15, fontWeight: '500' },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
});
