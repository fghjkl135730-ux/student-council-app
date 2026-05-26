import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEPARTMENTS, TASK_STATUS_LABELS } from '@/lib/constants';
import { Task, TaskStatus } from '@/lib/types';

const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'done'];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { state, updateTaskStatus, deleteEvent } = useApp();

  const event = state.events.find((e) => e.id === id);

  if (!event) {
    return (
      <ScreenContainer>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.muted }]}>행사를 찾을 수 없습니다.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary }}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const handleDeleteEvent = () => {
    Alert.alert('행사 삭제', `"${event.name}" 행사를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteEvent(event.id);
          router.back();
        },
      },
    ]);
  };

  const handleStatusChange = (task: Task) => {
    const currentIdx = STATUS_ORDER.indexOf(task.status);
    const nextStatus = STATUS_ORDER[(currentIdx + 1) % STATUS_ORDER.length];
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateTaskStatus(event.id, task.id, nextStatus);
  };

  // 부서별로 업무 그룹화
  const tasksByDept = event.tasks.reduce(
    (acc, task) => {
      if (!acc[task.department]) acc[task.department] = [];
      acc[task.department].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const totalTasks = event.tasks.length;
  const doneTasks = event.tasks.filter((t) => t.status === 'done').length;
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {event.name}
        </Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteEvent}>
          <IconSymbol name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 행사 정보 카드 */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={16} color={colors.muted} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              {formatDate(event.date)} {event.time}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="mappin" size={16} color={colors.muted} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>{event.location}</Text>
          </View>

          {/* 진행률 */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.muted }]}>전체 업무 진행률</Text>
              <Text style={[styles.progressCount, { color: colors.primary }]}>
                {doneTasks}/{totalTasks} 완료
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` as any, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 문서 버튼 */}
        <View style={styles.docSection}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>문서 작성</Text>
          <View style={styles.docButtons}>
            <TouchableOpacity
              style={[styles.docBtn, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}
              onPress={() => router.push(`/events/${event.id}/plan`)}
            >
              <IconSymbol name="doc.text" size={24} color={colors.primary} />
              <Text style={[styles.docBtnTitle, { color: colors.primary }]}>기획안</Text>
              <Text style={[styles.docBtnSub, { color: colors.muted }]}>
                {event.planDoc ? '작성됨' : '미작성'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.docBtn, { backgroundColor: '#10B981' + '12', borderColor: '#10B981' + '30' }]}
              onPress={() => router.push(`/events/${event.id}/report`)}
            >
              <IconSymbol name="list.bullet.clipboard" size={24} color="#10B981" />
              <Text style={[styles.docBtnTitle, { color: '#10B981' }]}>사무보고서</Text>
              <Text style={[styles.docBtnSub, { color: colors.muted }]}>
                {event.reportDoc ? '작성됨' : '미작성'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 부서별 업무 현황 */}
        <View style={styles.taskSection}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>부서별 업무 현황</Text>
          <Text style={[styles.sectionHint, { color: colors.muted }]}>
            업무 카드를 탭하면 상태가 변경됩니다
          </Text>

          {Object.entries(tasksByDept).map(([deptKey, tasks]) => {
            const dept = DEPARTMENTS[deptKey as keyof typeof DEPARTMENTS];
            return (
              <View key={deptKey} style={styles.deptGroup}>
                <View style={styles.deptHeader}>
                  <View style={[styles.deptColorBar, { backgroundColor: dept.color }]} />
                  <Text style={[styles.deptName, { color: colors.foreground }]}>{dept.name}</Text>
                </View>
                {tasks.map((task) => {
                  const statusInfo = TASK_STATUS_LABELS[task.status];
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[
                        styles.taskCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderLeftColor: dept.color,
                        },
                      ]}
                      onPress={() => handleStatusChange(task)}
                    >
                      <View style={styles.taskContent}>
                        <Text style={[styles.taskTitle, { color: colors.foreground }]}>
                          {task.title}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}

          {event.tasks.length === 0 && (
            <View style={styles.emptyTasks}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>배정된 업무가 없습니다.</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  deleteBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  docSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionHint: {
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
  },
  docButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  docBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  docBtnTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  docBtnSub: {
    fontSize: 12,
  },
  taskSection: {
    paddingHorizontal: 16,
  },
  deptGroup: {
    marginBottom: 16,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  deptColorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '700',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 8,
    gap: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 2,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  taskDeadline: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyTasks: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
