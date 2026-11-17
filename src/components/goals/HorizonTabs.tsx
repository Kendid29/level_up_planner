// Level Up Planner: Horizon Segmented Control
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GoalHorizon } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface HorizonTabsProps {
  selectedHorizon: GoalHorizon;
  onSelect: (horizon: GoalHorizon) => void;
}

const HORIZONS: { key: GoalHorizon; label: string; period: string }[] = [
  { key: 'short', label: 'Short-term', period: '0–3 mo' },
  { key: 'mid', label: 'Mid-term', period: '3–12 mo' },
  { key: 'long', label: 'Long-term', period: '1–5 yr' },
];

export function HorizonTabs({ selectedHorizon, onSelect }: HorizonTabsProps) {
  return (
    <View style={styles.container}>
      {HORIZONS.map((h) => {
        const isSelected = selectedHorizon === h.key;
        return (
          <Pressable
            key={h.key}
            onPress={() => onSelect(h.key)}
            style={[styles.tab, isSelected && styles.tabSelected]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${h.label}, ${h.period}`}
          >
            <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
              {h.label}
            </Text>
            <Text style={[styles.tabPeriod, isSelected && styles.tabPeriodSelected]}>
              {h.period}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.beige,
    borderRadius: radius.md,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  tabSelected: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.muted,
  },
  tabLabelSelected: {
    color: colors.forest,
  },
  tabPeriod: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
  },
  tabPeriodSelected: {
    color: colors.forest,
  },
});
