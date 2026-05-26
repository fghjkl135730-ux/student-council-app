import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEPARTMENTS } from '@/lib/constants';
import type { ActionItem } from '@/lib/types';

interface ActionItemWithDept extends ActionItem {
  department?: string;
}

export default function ActionItemsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, addActionItemsToEvent, addMeeting } = useApp();
  const params = useLocalSearchParams<{
    meetingId: string;
    meetingTitle: string;
    meetingDate: string;
    meetingContent: string;
    actionItems: string;
  }>();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedActionItems, setSelectedActionItems] = useState<Set<number>>(new Set());
  const [isLinking, setIsLinking] = useState(false);

  const actionItems: ActionItemWithDept[] = useMemo(() => {
    if (!params.actionItems) return [];
    try {
      return JSON.parse(params.actionItems);
    } catch {
      return [];
    }
  }, [params.actionItems]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  }, [state.events]);

  // 초기 로드 시 모든 액션 아이템 자동 선택
  React.useEffect(() => {
    if (actionItems.length > 0 && selectedActionItems.size === 0) {
      setSelectedActionItems(new Set(actionItems.map((_, i) => i)));
    }
  }, [actionItems, selectedActionItems.size]);

  const handleToggleActionItem = (index: number) => {
    const newSet = new Set(selectedActionItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedActionItems(newSet);
  };

  const handleSelectAll = () => {
    if (selectedActionItems.size === actionItems.length) {
      setSelectedActionItems(new Set());
    } else {
      setSelectedActionItems(new Set(actionItems.map((_, i) => i)));
    }
  };

  const handleLinkToEvent = () => {
    if (!selectedEventId) {
      Alert.alert('오류', '행사를 선택해주세요.');
      return;
    }
    if (selectedActionItems.size === 0) {
      Alert.alert('오류', '연동할 액션 아이템을 선택해주세요.');
      return;
    }

    // 중복 연동 방지
    if (isLinking) {
      return;
    }
    setIsLinking(true);

    const selectedItems = Array.from(selectedActionItems).map((i) => actionItems[i]);

    // 회의록 저장 (AI 요약 정보 포함)
    const meetingId = params.meetingId || Date.now().toString(36) + Math.random().toString(36).substr(2);
    const meeting = {
      id: meetingId,
      title: params.meetingTitle || '회의록',
      date: params.meetingDate || new Date().toISOString().split('T')[0],
      content: params.meetingContent || '',
      summary: {
        keyPoints: [],
        decisions: [],
        actionItems: actionItems,
        generatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addMeeting(meeting);

    // 선택된 액션 아이템을 행사에 추가
    addActionItemsToEvent(selectedEventId, meetingId, selectedItems);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // 더보기 탭으로 자동 이동
    setIsLinking(false);
    router.replace('/(tabs)/more');
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>액션 아이템 연동</Text>
        <TouchableOpacity
          style={[styles.linkBtn, { backgroundColor: selectedEventId && selectedActionItems.size > 0 ? colors.primary : colors.muted }]}
          onPress={handleLinkToEvent}
          disabled={!selectedEventId || selectedActionItems.size === 0}
        >
          <Text style={styles.linkBtnText}>연동</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 행사 선택 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>행사 선택</Text>
          {upcomingEvents.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>예정된 행사가 없습니다</Text>
            </View>
          ) : (
            <FlatList
              data={upcomingEvents}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item: event }) => (
                <Pressable
                  style={[
                    styles.eventOption,
                    { backgroundColor: colors.surface, borderColor: selectedEventId === event.id ? colors.primary : colors.border },
                    selectedEventId === event.id && { borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedEventId(event.id)}
                >
                  <View style={styles.eventOptionContent}>
                    <Text style={[styles.eventName, { color: colors.foreground }]}>{event.name}</Text>
                    <Text style={[styles.eventMeta, { color: colors.muted }]}>
                      {event.date} {event.time} · {event.location}
                    </Text>
                  </View>
                  {selectedEventId === event.id && (
                    <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                      <IconSymbol name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </Pressable>
              )}
            />
          )}
        </View>

        {/* 액션 아이템 선택 섹션 */}
        <View style={styles.section}>
          <View style={styles.actionItemsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>액션 아이템 ({selectedActionItems.size}/{actionItems.length})</Text>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={[styles.selectAllBtn, { color: colors.primary }]}>
                {selectedActionItems.size === actionItems.length ? '전체 해제' : '전체 선택'}
              </Text>
            </TouchableOpacity>
          </View>

          {actionItems.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>액션 아이템이 없습니다</Text>
            </View>
          ) : (
            actionItems.map((item, idx) => {
              const deptInfo = item.department ? DEPARTMENTS[item.department as keyof typeof DEPARTMENTS] : null;
              const isSelected = selectedActionItems.has(idx);
              return (
                <Pressable
                  key={idx}
                  style={[
                    styles.actionItemCard,
                    { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border },
                    isSelected && { borderWidth: 2 },
                  ]}
                  onPress={() => handleToggleActionItem(idx)}
                >
                  <View style={styles.actionItemContent}>
                    <View style={styles.actionItemTop}>
                      <View style={[styles.checkbox, { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primary : 'transparent' }]}>
                        {isSelected && <IconSymbol name="checkmark" size={14} color="#fff" />}
                      </View>
                      <Text style={[styles.actionTask, { color: colors.foreground }]} numberOfLines={2}>
                        {item.task}
                      </Text>
                    </View>

                    <View style={styles.actionItemMeta}>
                      {deptInfo && (
                        <View style={[styles.deptBadge, { backgroundColor: deptInfo.color + '18' }]}>
                          <View style={[styles.deptDot, { backgroundColor: deptInfo.color }]} />
                          <Text style={[styles.deptText, { color: deptInfo.color }]}>{deptInfo.shortName}</Text>
                        </View>
                      )}
                      {item.assignee && (
                        <View style={[styles.assigneeBadge, { backgroundColor: colors.border }]}>
                          <Text style={[styles.assigneeText, { color: colors.muted }]}>담당: {item.assignee}</Text>
                        </View>
                      )}
                      {item.deadline && (
                        <View style={[styles.deadlineBadge, { backgroundColor: '#F59E0B' + '18' }]}>
                          <Text style={[styles.deadlineText, { color: '#F59E0B' }]}>기한: {item.deadline}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  linkBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  linkBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  emptyBox: { borderRadius: 12, borderWidth: 1, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  eventOption: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventOptionContent: { flex: 1, gap: 4 },
  eventName: { fontSize: 15, fontWeight: '700' },
  eventMeta: { fontSize: 12 },
  checkmark: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionItemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  selectAllBtn: { fontSize: 12, fontWeight: '600' },
  actionItemCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  actionItemContent: { gap: 8 },
  actionItemTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  actionTask: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  actionItemMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  deptBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 3 },
  deptDot: { width: 5, height: 5, borderRadius: 2.5 },
  deptText: { fontSize: 11, fontWeight: '600' },
  assigneeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  assigneeText: { fontSize: 11, fontWeight: '600' },
  deadlineBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  deadlineText: { fontSize: 11, fontWeight: '600' },
});
