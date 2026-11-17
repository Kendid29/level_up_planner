// Level Up Planner: Tasks Screen
import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, CheckSquare } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { TaskFilter, Task } from '../../types/models';
import { colors, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { TaskFilterTabs } from '../../components/tasks/TaskFilterTabs';
import { TaskItem } from '../../components/tasks/TaskItem';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { filterTasks } from '../../domain/planning';
import { formatLocalDate } from '../../domain/dates';

export default function TasksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, goals, toggleTask, deleteTask, profile } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>('today');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const todayStr = formatLocalDate(new Date());
  const weekStart = profile?.week_start ?? 1;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, selectedFilter, todayStr, weekStart);
  }, [tasks, selectedFilter, todayStr, weekStart]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      today: filterTasks(tasks, 'today', todayStr, weekStart).length,
      upcoming: filterTasks(tasks, 'upcoming', todayStr, weekStart).length,
      this_week: filterTasks(tasks, 'this_week', todayStr, weekStart).length,
      completed: filterTasks(tasks, 'completed', todayStr, weekStart).length,
    };
  }, [tasks, todayStr, weekStart]);

  // Goal map for quick title lookup
  const goalMap = useMemo(() => {
    const map = new Map<string, string>();
    goals.forEach((g) => map.set(g.id, g.title));
    return map;
  }, [goals]);

  const filterNames: Record<TaskFilter, string> = {
    today: 'today',
    upcoming: 'upcoming',
    this_week: 'this week',
    completed: 'completed',
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Tasks"
        subtitle="Small steps, consistent compounding"
        rightAction={
          <Button
            title="Add Task"
            onPress={() => router.push('/tasks/new')}
            variant="primary"
            leftIcon={<Plus size={16} color={colors.white} strokeWidth={2.5} />}
            style={styles.headerBtn}
          />
        }
      />

      <TaskFilterTabs
        selectedFilter={selectedFilter}
        onSelect={setSelectedFilter}
        counts={counts}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onPress={() => router.push(`/tasks/${task.id}/edit`)}
              onDelete={() => setTaskToDelete(task)}
              goalTitle={task.goal_id ? goalMap.get(task.goal_id) : null}
            />
          ))
        ) : (
          <EmptyState
            icon={<CheckSquare size={44} color={colors.sage} strokeWidth={1.5} />}
            title={`No ${filterNames[selectedFilter]} tasks`}
            description={
              selectedFilter === 'completed'
                ? 'Completed tasks will appear here once you check them off.'
                : 'Take a moment to add one clear action step.'
            }
            actionTitle={selectedFilter !== 'completed' ? 'Add Task' : undefined}
            onAction={selectedFilter !== 'completed' ? () => router.push('/tasks/new') : undefined}
          />
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={taskToDelete !== null}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={async () => {
          if (taskToDelete) {
            await deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  headerBtn: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
});
