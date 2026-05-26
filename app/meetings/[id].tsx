import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { Meeting, MeetingSummary } from '@/lib/types';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const colors = useColors();
  const router = useRouter();
  const { state, addMeeting, updateMeeting, deleteMeeting } = useApp();

  const existingMeeting = isNew ? null : state.meetings.find((m) => m.id === id);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (existingMeeting) {
      setTitle(existingMeeting.title);
      setDate(existingMeeting.date);
      setContent(existingMeeting.content);
      if (existingMeeting.summary) {
        setSummary(existingMeeting.summary);
        setShowSummary(true);
      }
    }
  }, [existingMeeting?.id]);

  const summarizeMutation = trpc.meetings.summarize.useMutation();

  const handleSummarize = async () => {
    if (!content.trim() || content.length < 10) {
      Alert.alert('오류', '회의록 내용이 너무 짧습니다. 최소 10자 이상 입력해주세요.');
      return;
    }
    setIsSummarizing(true);
    try {
      const result = await summarizeMutation.mutateAsync({
        content,
        title: title || '회의록',
      });
      const newSummary: MeetingSummary = {
        keyPoints: result.keyPoints,
        decisions: result.decisions,
        actionItems: result.actionItems,
        generatedAt: result.generatedAt,
      };
      setSummary(newSummary);
      setShowSummary(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert('오류', 'AI 요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('입력 오류', '회의 제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('입력 오류', '회의록 내용을 입력해주세요.');
      return;
    }

    const now = new Date().toISOString();
    if (isNew) {
      const meeting: Meeting = {
        id: generateId(),
        title: title.trim(),
        date,
        content,
        summary: summary || undefined,
        createdAt: now,
        updatedAt: now,
      };
      addMeeting(meeting);
    } else if (existingMeeting) {
      updateMeeting({
        ...existingMeeting,
        title: title.trim(),
        date,
        content,
        summary: summary || undefined,
        updatedAt: now,
      });
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existingMeeting) return;
    Alert.alert('회의록 삭제', '이 회의록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteMeeting(existingMeeting.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isNew ? '새 회의록' : '회의록 편집'}
        </Text>
        <View style={styles.headerActions}>
          {!isNew && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <IconSymbol name="trash" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>저장</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 기본 정보 */}
        <View style={styles.section}>
          <View style={[styles.inputGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>제목</Text>
              <TextInput
                style={[styles.textInput, { color: colors.foreground }]}
                value={title}
                onChangeText={setTitle}
                placeholder="회의 제목"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
              />
            </View>
            <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>날짜</Text>
              <TextInput
                style={[styles.textInput, { color: colors.foreground }]}
                value={date}
                onChangeText={setDate}
                placeholder="2025-06-15"
                placeholderTextColor={colors.muted}
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        {/* 회의록 내용 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>회의록 내용</Text>
          <View style={[styles.textAreaContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textArea, { color: colors.foreground }]}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={12}
              placeholder="회의 내용을 입력하세요...&#10;&#10;논의 사항, 결정 내용, 다음 행동 계획 등을 자유롭게 작성하면 AI가 자동으로 요약해드립니다."
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
            />
          </View>

          {/* AI 요약 버튼 */}
          <TouchableOpacity
            style={[
              styles.summarizeBtn,
              {
                backgroundColor: isSummarizing ? colors.muted : colors.primary,
              },
            ]}
            onPress={handleSummarize}
            disabled={isSummarizing}
          >
            {isSummarizing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <IconSymbol name="sparkles" size={18} color="#fff" />
            )}
            <Text style={styles.summarizeBtnText}>
              {isSummarizing ? 'AI 요약 중...' : 'AI 자동 요약'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI 요약 결과 */}
        {showSummary && summary && (
          <View style={styles.section}>
            <View style={styles.summaryHeader}>
              <View style={[styles.summaryBadge, { backgroundColor: colors.primary + '18' }]}>
                <IconSymbol name="sparkles" size={14} color={colors.primary} />
                <Text style={[styles.summaryBadgeText, { color: colors.primary }]}>AI 요약 결과</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSummary(false)}>
                <IconSymbol name="xmark" size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* 핵심 내용 */}
            {summary.keyPoints.length > 0 && (
              <View style={[styles.summaryBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.summaryBlockTitle, { color: colors.foreground }]}>
                  📌 핵심 내용
                </Text>
                {summary.keyPoints.map((point, idx) => (
                  <View key={idx} style={styles.summaryItem}>
                    <View style={[styles.summaryDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.summaryItemText, { color: colors.foreground }]}>{point}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 결정사항 */}
            {summary.decisions.length > 0 && (
              <View style={[styles.summaryBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.summaryBlockTitle, { color: colors.foreground }]}>
                  ✅ 결정사항
                </Text>
                {summary.decisions.map((decision, idx) => (
                  <View key={idx} style={styles.summaryItem}>
                    <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.summaryItemText, { color: colors.foreground }]}>{decision}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 액션 아이템 */}
            {summary.actionItems.length > 0 && (
              <View style={[styles.summaryBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.summaryBlockTitle, { color: colors.foreground }]}>
                  🎯 액션 아이템
                </Text>
                {summary.actionItems.map((item, idx) => (
                  <View key={idx} style={[styles.actionItem, { borderColor: colors.border }]}>
                    <Text style={[styles.actionTask, { color: colors.foreground }]}>{item.task}</Text>
                    <View style={styles.actionMeta}>
                      {item.assignee && (
                        <View style={[styles.assigneeBadge, { backgroundColor: '#8B5CF6' + '18' }]}>
                          <Text style={[styles.assigneeText, { color: '#8B5CF6' }]}>
                            담당: {item.assignee}
                          </Text>
                        </View>
                      )}
                      {item.deadline && (
                        <View style={[styles.deadlineBadge, { backgroundColor: '#F59E0B' + '18' }]}>
                          <Text style={[styles.deadlineText, { color: '#F59E0B' }]}>
                            기한: {item.deadline}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.generatedAt, { color: colors.muted }]}>
              생성: {new Date(summary.generatedAt).toLocaleString('ko-KR')}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    width: 36,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  inputDivider: {
    height: 1,
    marginLeft: 16,
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 200,
  },
  summarizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  summarizeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  summaryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  summaryBlockTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  summaryItemText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  actionItem: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 6,
  },
  actionTask: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  assigneeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  assigneeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deadlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '600',
  },
  generatedAt: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
});
