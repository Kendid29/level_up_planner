// Level Up Planner: Data Management & Privacy Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  HardDrive,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  createDatabaseBackup,
  shareBackupFile,
  BackupResult,
} from '../../services/backupService';
import {
  pickAndValidateBackupFile,
  executeRestore,
  RestoreResult,
} from '../../services/restoreService';
import {
  exportEntityToCSV,
  exportAllEntitiesToCSV,
  ExportEntityType,
  EXPORT_ENTITY_CONFIGS,
} from '../../services/exportService';
import {
  getDatabaseOverview,
  clearAllUserData,
  DatabaseOverview,
} from '../../services/dataManagementService';
import { formatDisplayDate } from '../../domain/dates';
import { ValidationResult, BackupMetadata } from '../../domain/backupValidation';

export default function DataManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshData } = useApp();

  const [overview, setOverview] = useState<DatabaseOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // Backup State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState<BackupResult | null>(null);

  // Restore State
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [pendingRestorePayload, setPendingRestorePayload] = useState<BackupMetadata | null>(null);
  const [pendingValidation, setPendingValidation] = useState<ValidationResult | null>(null);
  const [backupCurrentBeforeRestore, setBackupCurrentBeforeRestore] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<RestoreResult | null>(null);

  // Export State
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Delete All Data State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const data = await getDatabaseOverview();
      setOverview(data);
    } catch (e) {
      console.error('Failed to load database overview', e);
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Handle Create Backup
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setBackupResult(null);
    try {
      const res = await createDatabaseBackup();
      setBackupResult(res);
      await loadOverview();
      // Prompt user to save/share the file
      await shareBackupFile(res.fileUri);
    } catch (err: any) {
      Alert.alert('Backup Error', err?.message || 'Failed to create backup.');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Handle Pick & Validate Restore
  const handleInitiateRestore = async () => {
    setIsPickingFile(true);
    setRestoreSuccess(null);
    try {
      const picked = await pickAndValidateBackupFile();
      if (picked.canceled) return;

      if (!picked.validation?.isValid) {
        Alert.alert(
          'Invalid Backup File',
          picked.validation?.error || 'The selected file is not a supported Level Up Planner backup.'
        );
        return;
      }

      setPendingRestorePayload(picked.payload || null);
      setPendingValidation(picked.validation);
      setRestoreModalVisible(true);
    } catch (err: any) {
      Alert.alert('Restore Error', err?.message || 'Could not process backup file.');
    } finally {
      setIsPickingFile(false);
    }
  };

  // Handle Confirm Restore
  const handleConfirmRestore = async () => {
    if (!pendingRestorePayload) return;

    setIsRestoring(true);
    try {
      const res = await executeRestore(pendingRestorePayload, {
        backupCurrentFirst: backupCurrentBeforeRestore,
      });
      setRestoreSuccess(res);
      setRestoreModalVisible(false);
      setPendingRestorePayload(null);
      await refreshData();
      await loadOverview();
    } catch (err: any) {
      Alert.alert('Restore Failed', err?.message || 'Failed to restore database from backup.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Export Single Entity CSV
  const handleExportEntity = async (entity: ExportEntityType) => {
    setIsExporting(true);
    setExportSuccessMessage(null);
    try {
      const res = await exportEntityToCSV(entity);
      setExportModalVisible(false);
      setExportSuccessMessage(`Exported ${res.rowCount} ${EXPORT_ENTITY_CONFIGS[entity].label.toLowerCase()} to CSV.`);
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to export CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Export All Entities CSV
  const handleExportAll = async () => {
    setIsExporting(true);
    setExportSuccessMessage(null);
    try {
      const results = await exportAllEntitiesToCSV();
      setExportModalVisible(false);
      const totalExported = results.reduce((sum, r) => sum + r.rowCount, 0);
      setExportSuccessMessage(`Exported ${results.length} CSV files with ${totalExported} total records to cache.`);
      Alert.alert('Export Complete', `All entities exported into ${results.length} separate CSV files in cache.`);
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to export all CSV files.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Delete All Data
  const handleConfirmDeleteAll = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Confirmation Required', 'Please type "DELETE" exactly to confirm.');
      return;
    }

    setIsDeletingAll(true);
    try {
      await clearAllUserData();
      setDeleteModalVisible(false);
      setDeleteConfirmationText('');
      await refreshData();
      await loadOverview();
      Alert.alert('Data Cleared', 'All personal planning data has been securely deleted. Standard categories and system defaults have been retained.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to delete data.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Data & Privacy"
        subtitle="Your goals. Your progress. Your data."
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Commitment Banner */}
        <Card style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <View style={styles.shieldWrapper}>
              <ShieldCheck size={20} color={colors.forest} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>100% Local & Private</Text>
              <Text style={styles.privacySubtitle}>
                Your notes, journals, goals, and habits reside solely on your device. You have full ownership to back up, export, or erase your data at any time.
              </Text>
            </View>
          </View>
        </Card>

        {/* Database Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Data Overview</Text>
          <Text style={styles.sectionSubtitle}>
            Local storage footprint and current record metrics
          </Text>
        </View>

        <Card style={styles.overviewCard}>
          {isLoadingOverview ? (
            <ActivityIndicator color={colors.forest} style={{ padding: spacing.xl }} />
          ) : overview ? (
            <>
              <View style={styles.overviewTopRow}>
                <View style={styles.storageBox}>
                  <HardDrive size={18} color={colors.forest} />
                  <Text style={styles.storageLabel}>Local Storage Footprint</Text>
                  <Text style={styles.storageValue}>{formatSize(overview.estimatedSizeBytes)}</Text>
                </View>
                <View style={styles.storageBox}>
                  <Calendar size={18} color={colors.forest} />
                  <Text style={styles.storageLabel}>Last Backup</Text>
                  <Text style={styles.storageValue}>
                    {overview.lastBackupDate
                      ? formatDisplayDate(overview.lastBackupDate.slice(0, 10))
                      : 'Never'}
                  </Text>
                </View>
              </View>

              <View style={styles.metricGrid}>
                <View style={styles.metricCell}>
                  <Text style={styles.metricNumber}>{overview.goalsCount}</Text>
                  <Text style={styles.metricLabel}>Goals</Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricNumber}>{overview.tasksCount}</Text>
                  <Text style={styles.metricLabel}>Tasks</Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricNumber}>{overview.habitsCount}</Text>
                  <Text style={styles.metricLabel}>Habits</Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricNumber}>{overview.notesCount}</Text>
                  <Text style={styles.metricLabel}>Notes</Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricNumber}>{overview.journalCount}</Text>
                  <Text style={styles.metricLabel}>Journal Entries</Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricNumber}>{overview.categoriesCount}</Text>
                  <Text style={styles.metricLabel}>Categories</Text>
                </View>
              </View>
            </>
          ) : null}
        </Card>

        {/* Action Result Banners */}
        {backupResult && (
          <Card style={styles.successCard}>
            <View style={styles.successIconRow}>
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={styles.successTitle}>Backup Created Successfully</Text>
            </View>
            <Text style={styles.successDetails}>
              {backupResult.fileName} ({formatSize(backupResult.fileSizeBytes)})
            </Text>
          </Card>
        )}

        {restoreSuccess && (
          <Card style={styles.successCard}>
            <View style={styles.successIconRow}>
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={styles.successTitle}>Data Restored Successfully</Text>
            </View>
            <Text style={styles.successDetails}>
              Restored {restoreSuccess.totalRestored} total records into your local planner.
            </Text>
          </Card>
        )}

        {exportSuccessMessage && (
          <Card style={styles.successCard}>
            <View style={styles.successIconRow}>
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={styles.successTitle}>CSV Export Complete</Text>
            </View>
            <Text style={styles.successDetails}>{exportSuccessMessage}</Text>
          </Card>
        )}

        {/* Backup & Restore Controls */}
        <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Backup & Restore</Text>
          <Text style={styles.sectionSubtitle}>
            Save your entire life planner into a portable JSON document
          </Text>
        </View>

        <Card style={styles.actionCard}>
          <View style={styles.actionCardContent}>
            <View style={styles.actionIconBox}>
              <Download size={20} color={colors.forest} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionCardTitle}>Create Backup (JSON)</Text>
              <Text style={styles.actionCardSubtitle}>
                Generates a single, complete snapshot of all goals, tasks, habits, and notes to save or share.
              </Text>
            </View>
          </View>
          <Button
            title="Create Backup"
            variant="primary"
            loading={isBackingUp}
            onPress={handleCreateBackup}
            style={styles.actionBtnFull}
          />
        </Card>

        <Card style={styles.actionCard}>
          <View style={styles.actionCardContent}>
            <View style={styles.actionIconBox}>
              <Upload size={20} color={colors.forest} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionCardTitle}>Restore Backup (JSON)</Text>
              <Text style={styles.actionCardSubtitle}>
                Select a previously created Level Up Planner backup file to restore your data.
              </Text>
            </View>
          </View>
          <Button
            title="Select Backup File"
            variant="secondary"
            loading={isPickingFile}
            onPress={handleInitiateRestore}
            style={styles.actionBtnFull}
          />
        </Card>

        {/* CSV Export Controls */}
        <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <Text style={styles.sectionSubtitle}>
            Export your records to CSV for spreadsheets or personal archives
          </Text>
        </View>

        <Card style={styles.actionCard}>
          <View style={styles.actionCardContent}>
            <View style={styles.actionIconBox}>
              <FileSpreadsheet size={20} color={colors.forest} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionCardTitle}>Export Data to CSV</Text>
              <Text style={styles.actionCardSubtitle}>
                Download clean, formatted spreadsheets of your goals, tasks, habits, or reflections with formula protection.
              </Text>
            </View>
          </View>
          <Button
            title="Choose Entity to Export"
            variant="secondary"
            onPress={() => setExportModalVisible(true)}
            style={styles.actionBtnFull}
          />
        </Card>

        {/* Danger Zone: Clear Data */}
        <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
          <Text style={styles.sectionSubtitle}>
            Permanently delete your local records
          </Text>
        </View>

        <Card style={styles.dangerCard}>
          <View style={styles.actionCardContent}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.error + '15' }]}>
              <Trash2 size={20} color={colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionCardTitle, { color: colors.error }]}>
                Delete All Data
              </Text>
              <Text style={styles.actionCardSubtitle}>
                Irreversibly remove all personal tasks, goals, habits, notes, and journal entries. Default system categories will be kept.
              </Text>
            </View>
          </View>
          <Button
            title="Delete All Data"
            variant="secondary"
            onPress={() => {
              setDeleteConfirmationText('');
              setDeleteModalVisible(true);
            }}
            style={[styles.actionBtnFull, { borderColor: colors.error + '40' }]}
            textStyle={{ color: colors.error }}
          />
        </Card>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Restore Confirmation Modal */}
      <Modal
        visible={restoreModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRestoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconCircle}>
                <Upload size={22} color={colors.forest} />
              </View>
              <Text style={styles.modalTitle}>Confirm Data Restore</Text>
            </View>

            <Text style={styles.modalDescription}>
              This will replace your current planner data with the selected backup:
            </Text>

            {pendingValidation?.summary && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryDateText}>
                  Backup Created: {formatDisplayDate(pendingValidation.summary.createdAt.slice(0, 10))}
                </Text>
                <View style={styles.summaryGrid}>
                  <Text style={styles.summaryItem}>Goals: {pendingValidation.summary.breakdown.goals || 0}</Text>
                  <Text style={styles.summaryItem}>Tasks: {pendingValidation.summary.breakdown.tasks || 0}</Text>
                  <Text style={styles.summaryItem}>Habits: {pendingValidation.summary.breakdown.habits || 0}</Text>
                  <Text style={styles.summaryItem}>Notes: {pendingValidation.summary.breakdown.notes || 0}</Text>
                  <Text style={styles.summaryItem}>Journal: {pendingValidation.summary.breakdown.journal_entries || 0}</Text>
                  <Text style={styles.summaryItem}>Total: {pendingValidation.summary.totalItems} items</Text>
                </View>
              </View>
            )}

            <View style={styles.preBackupToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Create Safety Backup First</Text>
                <Text style={styles.toggleSubtitle}>Save current state before replacing</Text>
              </View>
              <Switch
                value={backupCurrentBeforeRestore}
                onValueChange={setBackupCurrentBeforeRestore}
                trackColor={{ false: colors.line, true: colors.paleSage }}
                thumbColor={backupCurrentBeforeRestore ? colors.forest : '#FFFFFF'}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setRestoreModalVisible(false)}
                style={styles.modalBtn}
              />
              <Button
                title="Restore Data"
                variant="primary"
                loading={isRestoring}
                onPress={handleConfirmRestore}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* CSV Export Entity Picker Modal */}
      <Modal
        visible={exportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>Select Data to Export</Text>
            <Text style={styles.modalDescription}>
              Choose a specific collection to export as a formatted CSV file:
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: spacing.sm }}>
              {(Object.keys(EXPORT_ENTITY_CONFIGS) as ExportEntityType[]).map((key) => {
                const conf = EXPORT_ENTITY_CONFIGS[key];
                return (
                  <Pressable
                    key={key}
                    onPress={() => handleExportEntity(key)}
                    style={({ pressed }) => [styles.exportOptionRow, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`Export ${conf.label}`}
                  >
                    <View style={styles.exportOptionLeft}>
                      <FileSpreadsheet size={18} color={colors.forest} />
                      <Text style={styles.exportOptionLabel}>Export {conf.label}</Text>
                    </View>
                    <ChevronRight size={16} color={colors.muted} />
                  </Pressable>
                );
              })}

              <View style={styles.exportDivider} />

              <Pressable
                onPress={handleExportAll}
                style={({ pressed }) => [styles.exportOptionRow, styles.exportAllRow, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Export All as CSV Files"
              >
                <View style={styles.exportOptionLeft}>
                  <Sparkles size={18} color={colors.forest} />
                  <Text style={[styles.exportOptionLabel, { fontWeight: '700' }]}>
                    Export All Collections
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.forest} />
              </Pressable>
            </ScrollView>

            <Button
              title="Close"
              variant="secondary"
              onPress={() => setExportModalVisible(false)}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </Modal>

      {/* Delete All Data Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconCircle, { backgroundColor: colors.error + '20' }]}>
                <AlertTriangle size={22} color={colors.error} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.error }]}>Delete All Data?</Text>
            </View>

            <Text style={styles.modalDescription}>
              This will permanently wipe all your tasks, goals, habits, notes, and reflections. This action cannot be undone.
            </Text>

            <Text style={styles.confirmationInstruction}>
              Please type <Text style={{ fontWeight: '700', color: colors.error }}>DELETE</Text> to confirm:
            </Text>

            <TextInput
              style={styles.deleteInput}
              value={deleteConfirmationText}
              onChangeText={setDeleteConfirmationText}
              placeholder="DELETE"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setDeleteModalVisible(false)}
                style={styles.modalBtn}
              />
              <Button
                title="Permanently Delete"
                variant="primary"
                loading={isDeletingAll}
                onPress={handleConfirmDeleteAll}
                style={[styles.modalBtn, { backgroundColor: colors.error }]}
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
  privacyCard: {
    backgroundColor: colors.paleSage,
    borderColor: colors.sage,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  privacyHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  shieldWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  privacyTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.forest,
    marginBottom: 2,
  },
  privacySubtitle: {
    ...typography.caption,
    color: colors.charcoal,
    lineHeight: 18,
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
  overviewCard: {
    padding: spacing.base,
    backgroundColor: colors.paper,
    marginBottom: spacing.sm,
  },
  overviewTopRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: spacing.md,
  },
  storageBox: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'flex-start',
  },
  storageLabel: {
    ...typography.caption,
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
    marginBottom: 2,
  },
  storageValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.charcoal,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metricCell: {
    width: '31%',
    backgroundColor: colors.cream,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricNumber: {
    ...typography.h3,
    fontSize: 18,
    color: colors.forest,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: colors.paleSage,
    borderColor: colors.success,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  successIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  successTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.success,
  },
  successDetails: {
    ...typography.caption,
    color: colors.charcoal,
  },
  actionCard: {
    padding: spacing.base,
    backgroundColor: colors.paper,
    marginBottom: spacing.md,
  },
  actionCardContent: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 2,
  },
  actionCardSubtitle: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
  },
  actionBtnFull: {
    width: '100%',
  },
  dangerCard: {
    padding: spacing.base,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.error + '30',
    marginBottom: spacing.md,
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
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.paleSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.charcoal,
    flex: 1,
  },
  modalDescription: {
    ...typography.bodySmall,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  summaryBox: {
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryDateText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.forest,
    marginBottom: spacing.xs,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  summaryItem: {
    width: '48%',
    ...typography.caption,
    color: colors.charcoal,
  },
  preBackupToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginBottom: spacing.lg,
  },
  toggleTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.charcoal,
  },
  toggleSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.muted,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
  exportOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  exportAllRow: {
    backgroundColor: colors.paleSage,
    borderRadius: radius.md,
    borderBottomWidth: 0,
    marginTop: spacing.xs,
  },
  exportOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  exportOptionLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.charcoal,
  },
  exportDivider: {
    height: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  confirmationInstruction: {
    ...typography.bodySmall,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  deleteInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.cream,
    ...typography.body,
    fontWeight: '700',
    color: colors.error,
    marginBottom: spacing.xl,
  },
});
