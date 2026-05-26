import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEPARTMENTS } from '@/lib/constants';
import { Department, Task } from '@/lib/types';

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // 부서별 업무 통계
  const deptStats = Object.entries(DEPARTMENTS).map(([key, info]) => {
    const allTasks = state.events.flatMap((e) => e.tasks).filter((t) => t.department === key);
    const done = allTasks.filter((t) => t.status === 'done').length;
    const inProgress = allTasks.filter((t) => t.status === 'in_progress').length;
    const pending = allTasks.filter((t) => t.status === 'pending').length;
    return { key: key as Department, info, total: allTasks.length, done, inProgress, pending };
  });

  return (
    <ScreenContainer className="flex-1">
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>더보기</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 회의록 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>회의록 관리</Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/meetings')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#4F6AF5' + '18' }]}>
              <IconSymbol name="note.text" size={22} color="#4F6AF5" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.foreground }]}>회의록</Text>
              <Text style={[styles.menuSubtitle, { color: colors.muted }]}>
                {state.meetings.length}개 · AI 자동 요약 지원
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* 부서별 업무 현황 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>부서별 업무 현황</Text>
          {deptStats.map(({ key, info, total, done, inProgress, pending }) => (
            <TouchableOpacity
              key={key}
              style={[styles.deptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setSelectedDept(key)}
              activeOpacity={0.7}
            >
              <View style={styles.deptHeader}>
                <View style={[styles.deptColorBar, { backgroundColor: info.color }]} />
                <Text style={[styles.deptName, { color: colors.foreground }]}>{info.name}</Text>
                <Text style={[styles.deptTotal, { color: colors.muted }]}>총 {total}개</Text>
              </View>
              {total > 0 ? (
                <View style={styles.deptStats}>
                  <DeptStatChip label="대기" count={pending} color="#6B7280" bgColor="#F3F4F6" />
                  <DeptStatChip label="진행중" count={inProgress} color="#F59E0B" bgColor="#FEF3C7" />
                  <DeptStatChip label="완료" count={done} color="#10B981" bgColor="#D1FAE5" />
                </View>
              ) : (
                <Text style={[styles.noTask, { color: colors.muted }]}>배정된 업무 없음</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 부서별 상세 보기 모달 */}
      {selectedDept && (
        <DeptDetailModal
          dept={selectedDept}
          tasks={state.events.flatMap((e) => e.tasks).filter((t) => t.department === selectedDept)}
          onClose={() => setSelectedDept(null)}
          colors={colors}
        />
      )}
    </ScreenContainer>
  );
}

function DeptStatChip({
  label,
  count,
  color,
  bgColor,
}: {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: bgColor }]}>
      <Text style={[styles.chipCount, { color }]}>{count}</Text>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
    </View>
  );
}

function DeptDetailModal({
  dept,
  tasks,
  onClose,
  colors,
}: {
  dept: Department;
  tasks: Task[];
  onClose: () => void;
  colors: any;
}) {
  const deptInfo = DEPARTMENTS[dept];
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* 헤더 */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={[styles.modalDeptBadge, { backgroundColor: deptInfo.color + '18' }]}>
              <View style={[styles.modalDeptDot, { backgroundColor: deptInfo.color }]} />
              <Text style={[styles.modalDeptName, { color: deptInfo.color }]}>{deptInfo.name}</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* 업무 목록 */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
            {/* 대기 중인 업무 */}
            {pendingTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={[styles.taskSectionTitle, { color: colors.muted }]}>대기 중 ({pendingTasks.length})</Text>
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} colors={colors} />
                ))}
              </View>
            )}

            {/* 진행 중인 업무 */}
            {inProgressTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={[styles.taskSectionTitle, { color: colors.muted }]}>진행 중 ({inProgressTasks.length})</Text>
                {inProgressTasks.map((task) => (
                  <TaskItem key={task.id} task={task} colors={colors} />
                ))}
              </View>
            )}

            {/* 완료된 업무 */}
            {doneTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={[styles.taskSectionTitle, { color: colors.muted }]}>완료됨 ({doneTasks.length})</Text>
                {doneTasks.map((task) => (
                  <TaskItem key={task.id} task={task} colors={colors} />
                ))}
              </View>
            )}

            {tasks.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.muted }]}>배정된 업무가 없습니다</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TaskItem({ task, colors }: { task: Task; colors: any }) {
  const statusColors = {
    pending: '#6B7280',
    in_progress: '#F59E0B',
    done: '#10B981',
  };
  const statusLabels = {
    pending: '대기',
    in_progress: '진행중',
    done: '완료',
  };

  return (
    <View style={[styles.taskItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, { color: colors.foreground }]}>{task.title}</Text>
        {task.meetingId && (
          <Text style={[styles.taskMeta, { color: colors.muted }]}>회의록 연동</Text>
        )}
      </View>
      <View style={[styles.taskStatus, { backgroundColor: statusColors[task.status] + '18' }]}>
        <Text style={[styles.taskStatusText, { color: statusColors[task.status] }]}>
          {statusLabels[task.status]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  deptCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  deptColorBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  deptName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  deptTotal: {
    fontSize: 12,
  },
  deptStats: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  noTask: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalDeptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  modalDeptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalDeptName: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  taskSection: {
    marginBottom: 20,
  },
  taskSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskMeta: {
    fontSize: 11,
  },
  taskStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});
