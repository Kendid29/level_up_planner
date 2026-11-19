// Level Up Planner: Custom Categories Management Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Tag, Edit2, Trash2, Check, AlertCircle } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types/models';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

const PALETTE = [
  '#526B56', // Forest
  '#7A9073', // Sage
  '#4A7C59', // Deep green
  '#A36F39', // Amber / Caramel
  '#B05B3B', // Terracotta
  '#4B6B82', // Slate blue
  '#6D597A', // Muted violet
  '#8B5E3C', // Warm brown
  '#5C6B73', // Charcoal tint
];

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryUsageCounts,
  } = useApp();

  // Create / Edit modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete flow state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [reassignCategoryName, setReassignCategoryName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSelectedColor(PALETTE[0]);
    setFormError(null);
    setModalVisible(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSelectedColor(cat.color || PALETTE[0]);
    setFormError(null);
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Category name cannot be empty.');
      return;
    }

    const duplicate = categories.find(
      (c) =>
        c.name.toLowerCase() === trimmed.toLowerCase() &&
        c.id !== editingCategory?.id
    );
    if (duplicate) {
      setFormError('A category with this name already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: trimmed,
          color: selectedColor,
        });
      } else {
        await createCategory({
          name: trimmed,
          color: selectedColor,
          icon: null,
          is_default: 0,
          archived_at: null,
        });
      }
      setModalVisible(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateDelete = async (cat: Category) => {
    if (cat.is_default === 1) {
      Alert.alert(
        'System Category',
        'Standard categories cannot be deleted to ensure system stability.'
      );
      return;
    }

    setCategoryToDelete(cat);
    const count = await getCategoryUsageCounts(cat.name);
    setUsageCount(count.total);

    // Pick first other available category as default reassignment
    const fallback = categories.find((c) => c.id !== cat.id)?.name || 'General';
    setReassignCategoryName(fallback);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(
        categoryToDelete.id,
        usageCount > 0 ? reassignCategoryName : undefined
      );
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultCategories = categories.filter((c) => c.is_default === 1);
  const customCategories = categories.filter((c) => c.is_default !== 1);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Life Categories"
        subtitle="Organize goals, tasks, and habits"
        showBack
        onBack={() => router.back()}
        rightAction={
          <Button
            title="Add"
            onPress={openCreateModal}
            variant="primary"
            leftIcon={<Plus size={16} color={colors.white} strokeWidth={2.5} />}
            style={styles.addBtn}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom categories section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Custom Categories</Text>
          <Text style={styles.sectionSubtitle}>
            Categories you created for your unique focus areas
          </Text>
        </View>

        {customCategories.length > 0 ? (
          customCategories.map((cat) => (
            <Card key={cat.id} style={styles.categoryCard}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: cat.color || colors.forest },
                  ]}
                />
                <Text style={styles.categoryName}>{cat.name}</Text>
              </View>

              <View style={styles.categoryActions}>
                <Pressable
                  onPress={() => openEditModal(cat)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${cat.name}`}
                >
                  <Edit2 size={16} color={colors.charcoal} strokeWidth={2} />
                </Pressable>
                <Pressable
                  onPress={() => handleInitiateDelete(cat)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.deleteBtn,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${cat.name}`}
                >
                  <Trash2 size={16} color={colors.error} strokeWidth={2} />
                </Pressable>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Tag size={24} color={colors.sage} strokeWidth={1.5} />
            <Text style={styles.emptyCardText}>
              No custom categories yet. Tap &apos;Add&apos; to create one.
            </Text>
          </Card>
        )}

        {/* Default categories section */}
        <View style={[styles.sectionHeader, { marginTop: spacing['2xl'] }]}>
          <Text style={styles.sectionTitle}>Default Categories</Text>
          <Text style={styles.sectionSubtitle}>
            Core life pillars available across all planning tools
          </Text>
        </View>

        {defaultCategories.map((cat) => (
          <Card key={cat.id} style={styles.categoryCard}>
            <View style={styles.categoryLeft}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: cat.color || colors.forest },
                ]}
              />
              <Text style={styles.categoryName}>{cat.name}</Text>
            </View>
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Standard</Text>
            </View>
          </Card>
        ))}

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </Text>

            <Input
              label="Category Name"
              placeholder="e.g. Creative Projects"
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (formError) setFormError(null);
              }}
              error={formError}
              autoFocus
            />

            <Text style={styles.label}>Badge Color</Text>
            <View style={styles.paletteRow}>
              {PALETTE.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    selectedColor === c && styles.selectedColorOption,
                  ]}
                >
                  {selectedColor === c && (
                    <Check size={16} color={colors.white} strokeWidth={3} />
                  )}
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={styles.modalActionBtn}
              />
              <Button
                title={editingCategory ? 'Save Changes' : 'Create Category'}
                variant="primary"
                loading={isSubmitting}
                onPress={handleSaveCategory}
                style={styles.modalActionBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete / Reassign Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warnIconRow}>
              <AlertCircle size={28} color={colors.error} strokeWidth={2} />
              <Text style={styles.deleteModalTitle}>
                Delete &ldquo;{categoryToDelete?.name}&rdquo;?
              </Text>
            </View>

            {usageCount > 0 ? (
              <View style={styles.usageWarningBox}>
                <Text style={styles.usageWarningText}>
                  This category is currently assigned to{' '}
                  <Text style={{ fontWeight: '700' }}>{usageCount}</Text> active
                  item(s). Please choose a replacement category:
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.reassignChipScroll}
                >
                  {categories
                    .filter((c) => c.id !== categoryToDelete?.id)
                    .map((c) => (
                      <Pressable
                        key={c.id}
                        onPress={() => setReassignCategoryName(c.name)}
                        style={[
                          styles.reassignChip,
                          reassignCategoryName === c.name &&
                            styles.reassignChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.reassignChipText,
                            reassignCategoryName === c.name &&
                              styles.reassignChipTextSelected,
                          ]}
                        >
                          {c.name}
                        </Text>
                      </Pressable>
                    ))}
                </ScrollView>
              </View>
            ) : (
              <Text style={styles.deleteModalText}>
                No items are currently using this category. It will be safely
                removed.
              </Text>
            )}

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setDeleteModalVisible(false)}
                style={styles.modalActionBtn}
              />
              <Button
                title="Delete"
                variant="primary"
                loading={isDeleting}
                onPress={handleConfirmDelete}
                style={[styles.modalActionBtn, { backgroundColor: colors.error }]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  addBtn: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.charcoal,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.muted,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.charcoal,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    borderColor: colors.error + '40',
  },
  pressed: {
    opacity: 0.6,
  },
  defaultBadge: {
    backgroundColor: colors.beige,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  defaultBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyCardText: {
    ...typography.caption,
    color: colors.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(51, 56, 49, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.paper,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.charcoal,
    marginBottom: spacing.base,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  colorOption: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: colors.charcoal,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalActionBtn: {
    flex: 1,
  },
  warnIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  deleteModalTitle: {
    ...typography.h3,
    color: colors.charcoal,
    flex: 1,
  },
  deleteModalText: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  usageWarningBox: {
    marginBottom: spacing.xl,
  },
  usageWarningText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  reassignChipScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  reassignChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cream,
  },
  reassignChipSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  reassignChipText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.charcoal,
  },
  reassignChipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
});
