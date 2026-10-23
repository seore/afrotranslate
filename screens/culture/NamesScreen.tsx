// Searchable list of names. Search ignores tone marks, so typing
// "adebayo" finds "Adébáyọ̀"; it also matches meanings and themes.

import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { StepHeader } from '../../components/ui/StepHeader';
import { getCulture } from '../../content';
import { LEARNABLE_LANGUAGES } from '../../content/languages';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { searchNames } from '../../lib/culture';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Names'>;
type GenderFilter = 'all' | 'boy' | 'girl';

const FILTERS: { id: GenderFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'girl', label: 'Girls' },
  { id: 'boy', label: 'Boys' },
];

export default function NamesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useLearnerProfile();
  const language = profile.language ?? 'yo';
  const languageName = LEARNABLE_LANGUAGES.find((l) => l.code === language)?.native ?? '';
  const names = useMemo(() => getCulture(language)?.names ?? [], [language]);
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState<GenderFilter>('all');
  const results = useMemo(() => searchNames(names, query, gender), [names, query, gender]);

  return (
    <LinearGradient colors={colors.gradient} style={[styles.fill, { paddingTop: insets.top }]}>
      <FlatList
        data={results}
        keyExtractor={(n) => n.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        ListHeaderComponent={
          <View>
            <StepHeader title={`${languageName} names`} onBack={navigation.goBack} />
            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search a name or meaning"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                accessibilityLabel="Search names"
              />
            </View>
            <View style={styles.filters} accessibilityRole="tablist">
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setGender(f.id)}
                  style={[styles.chip, gender === f.id && styles.chipOn]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: gender === f.id }}
                >
                  <Text style={[styles.chipText, gender === f.id && styles.chipTextOn]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No names match “{query}”.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('NameDetail', { nameId: item.id })}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}: ${item.meaning}`}
            activeOpacity={0.8}
          >
            <View style={styles.flex}>
              <Text style={styles.name} accessibilityLanguage={language}>
                {item.name}
              </Text>
              <Text style={styles.meaning}>{item.meaning}</Text>
            </View>
            <Text style={styles.theme}>{item.theme}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
    color: colors.text,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  chipOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextOn: {
    color: colors.accent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  name: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '800',
    color: colors.text,
  },
  meaning: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  theme: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  empty: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
});
