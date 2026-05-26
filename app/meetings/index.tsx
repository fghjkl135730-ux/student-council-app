import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Meeting } from '@/lib/types';

export default function MeetingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, deleteMeeting } = useApp();

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>회의록</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/meetings/new')}
        >
          <IconSymbol name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.meetings}
        keyExtractor={(item: Meeting) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.meetingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/meetings/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.summary && (
                  <View style={[styles.aiTag, { backgroundColor: colors.primary + '18' }]}>
                    <IconSymbol name="sparkles" size={12} color={colors.primary} />
                    <Text style={[styles.aiTagText, { color: colors.primary }]}>AI 요약</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.cardDate, { color: colors.muted }]}>{formatDate(item.date)}</Text>
            </View>
            <Text style={[styles.cardPreview, { color: colors.muted }]} numberOfLines={2}>
              {item.content}
            </Text>
            {item.summary && (
              <View style={[styles.summaryPreview, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
                <Text style={[styles.summaryPreviewText, { color: colors.primary }]} numberOfLines={1}>
                  핵심: {item.summary.keyPoints[0] || '요약 없음'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="note.text" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>회의록이 없습니다</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
              + 버튼을 눌러 회의록을 작성하고{'\n'}AI 자동 요약을 사용해보세요
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/meetings/new')}
            >
              <Text style={styles.emptyButtonText}>회의록 작성하기</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 13,
  },
  cardPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  summaryPreview: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryPreviewText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
