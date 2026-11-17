// Level Up Planner — Notes & Journal Screen
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search, FileText, BookOpen } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { NoteCard } from '../../components/notes/NoteCard';
import { JournalCard } from '../../components/notes/JournalCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

type SubTab = 'notes' | 'journal';

export default function NotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes, journalEntries } = useApp();
  const [activeTab, setActiveTab] = useState<SubTab>('notes');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      (n.category && n.category.toLowerCase().includes(q))
    );
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={activeTab === 'notes' ? 'Notes' : 'Journal'}
        subtitle={
          activeTab === 'notes'
            ? 'Ideas, references, and planning notes'
            : 'Private daily thoughts and reflections'
        }
        rightAction={
          <Button
            title={activeTab === 'notes' ? 'Add Note' : 'New Entry'}
            onPress={() =>
              activeTab === 'notes'
                ? router.push('/notes/new')
                : router.push('/journal/new')
            }
            variant="primary"
            leftIcon={<Plus size={16} color={colors.white} strokeWidth={2.5} />}
            style={styles.headerBtn}
          />
        }
      />

      {/* Segmented SubTab Switcher */}
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => setActiveTab('notes')}
          style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'notes' }}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            Notes ({notes.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('journal')}
          style={[styles.tab, activeTab === 'journal' && styles.tabActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'journal' }}
        >
          <Text style={[styles.tabText, activeTab === 'journal' && styles.tabTextActive]}>
            Journal ({journalEntries.length})
          </Text>
        </Pressable>
      </View>

      {/* Search Bar for Notes */}
      {activeTab === 'notes' ? (
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Search size={18} color={colors.muted} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'notes' ? (
          filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() => router.push(`/notes/${note.id}/edit`)}
              />
            ))
          ) : (
            <EmptyState
              icon={<FileText size={44} color={colors.sage} strokeWidth={1.5} />}
              title={searchQuery ? 'No notes match your search' : 'No notes yet'}
              description={
                searchQuery
                  ? 'Try searching with a different keyword.'
                  : 'Capture ideas, study points, or references before they slip away.'
              }
              actionTitle={!searchQuery ? 'Add a Note' : undefined}
              onAction={!searchQuery ? () => router.push('/notes/new') : undefined}
            />
          )
        ) : journalEntries.length > 0 ? (
          journalEntries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onPress={() => router.push(`/journal/${entry.id}/edit`)}
            />
          ))
        ) : (
          <EmptyState
            icon={<BookOpen size={44} color={colors.sage} strokeWidth={1.5} />}
            title="Your journal is empty"
            description="Take a moment to record your thoughts, reflections, and progress."
            actionTitle="Write First Entry"
            onAction={() => router.push('/journal/new')}
          />
        )}
      </ScrollView>
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
  tabContainer: {
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
  tabActive: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.forest,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.charcoal,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
});
