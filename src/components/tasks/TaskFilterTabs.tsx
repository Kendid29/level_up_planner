// Level Up Planner — Task Filter Tabs
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TaskFilter } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface TaskFilterTabsProps {
  selectedFilter: TaskFilter;
  onSelect: (filter: TaskFilter) => void;
  counts?: Partial<Record<TaskFilter, number>>;
}

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'this_week', label: 'This Week' },
  { key: 'completed', label: 'Completed' },
];

export function TaskFilterTabs({
  selectedFilter,
  onSelect,
  counts,
}: TaskFilterTabsProps) {
  return (
    <View style={styles.container}>
      {FILTERS.map((f) => {
        const isSelected = selectedFilter === f.key;
        const count = counts?.[f.key];
        return (
          <Pressable
            key={f.key}
            onPress={() => onSelect(f.key)}
            style={[styles.tab, isSelected && styles.tabSelected]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${f.label} tasks`}
          >
            <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
              {f.label}
            </Text>
            {count !== undefined ? (
              <View
                style={[
                  styles.badge,
                  isSelected ? styles.badgeSelected : styles.badgeDefault,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isSelected ? styles.badgeTextSelected : styles.badgeTextDefault,
                  ]}
                >
                  {count}
                </Text>
              </View>
            ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: 4,
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
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  badgeDefault: {
    backgroundColor: colors.cream,
  },
  badgeSelected: {
    backgroundColor: colors.paleSage,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextDefault: {
    color: colors.muted,
  },
  badgeTextSelected: {
    color: colors.forest,
  },
});
