// Level Up Planner: Task Filter Tabs
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
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
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
];

export function TaskFilterTabs({
  selectedFilter,
  onSelect,
  counts,
}: TaskFilterTabsProps) {
  return (
    <View style={styles.outerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((f) => {
          const isSelected = selectedFilter === f.key;
          const count = counts?.[f.key];
          const isOverdueTab = f.key === 'overdue' && (count ?? 0) > 0;
          return (
            <Pressable
              key={f.key}
              onPress={() => onSelect(f.key)}
              style={[
                styles.tab,
                isSelected && styles.tabSelected,
                isOverdueTab && !isSelected && styles.tabOverdueBorder,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${f.label} tasks`}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isSelected && styles.tabLabelSelected,
                  isOverdueTab && !isSelected && styles.tabLabelOverdue,
                ]}
              >
                {f.label}
              </Text>
              {count !== undefined ? (
                <View
                  style={[
                    styles.badge,
                    isSelected ? styles.badgeSelected : styles.badgeDefault,
                    isOverdueTab && !isSelected ? styles.badgeOverdue : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isSelected ? styles.badgeTextSelected : styles.badgeTextDefault,
                      isOverdueTab && !isSelected ? styles.badgeTextOverdue : null,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  scrollContent: {
    flexDirection: 'row',
    backgroundColor: colors.beige,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: 6,
  },
  tabSelected: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabOverdueBorder: {
    borderWidth: 1,
    borderColor: '#E2B89D',
  },
  tabLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.muted,
  },
  tabLabelSelected: {
    color: colors.forest,
  },
  tabLabelOverdue: {
    color: '#8A4A36',
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
  badgeOverdue: {
    backgroundColor: '#FDEEE9',
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
  badgeTextOverdue: {
    color: '#8A4A36',
  },
});
