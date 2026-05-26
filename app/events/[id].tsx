import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/store/AppContext';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEPARTMENTS, TASK_STATUS_LABELS } from '@/lib/constants';
import { Task, TaskStatus, Department } from '@/lib/types';

const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'done'];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { state, updateTaskStatus, deleteEvent, addTaskToEvent, updateTask, deleteTask } = useApp();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department>('planning');
  const [taskTitle, setTaskTitle] = useState('');

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

  const handleStatusChange = (task: Task) => {
    const currentIndex = STATUS_ORDER.indexOf(task.status);
    const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
    updateTaskStatus(event.id, task.id, nextStatus);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteEvent = () => {
    Alert.alert('행사 삭제', '정말 이 행사를 삭제하시겠습니까?', [
      { text: '취소', onPress: () => {} },
      {
        text: '삭제',
        onPress: () => {
          deleteEvent(event.id);
          router.back();
        },
        style: 'destructive',
      },
    ]);
  };

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('입력 오류', '업무 제목을 입력해주세요.');
      return;
    }
    addTaskToEvent(event.id, { title: taskTitle.trim(), department: selectedDept });
    setTaskTitle('');
    setShowAddTaskModal(false);
    setSelectedDept('planning');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setSelectedDept(task.department);
    setShowEditModal(true);
  };

  const handleUpdateTask = () => {
    if (!editingTask || !taskTitle.trim()) {
      Alert.alert('입력 오류', '업무 제목을 입력해주세요.');
      return;
    }
    updateTask(event.id, editingTask.id, { title: taskTitle.trim(), department: selectedDept });
    setTaskTitle('');
    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('업무 삭제', '정말 이 업무를 삭제하시겠습니까?', [
      { text: '취소', onPress: () => {} },
      {
        text: '삭제',
        onPress: () => {
          deleteTask(event.id, taskId);
        },
        style: 'destructive',
      },
    ]);
  };

  // 부서별로 업무 그룹화
  const tasksByDept = Object.entries(DEPARTMENTS).reduce(
    (acc, [key]) => {
      acc[key] = event.tasks.filter((t) => t.department === key);
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
          <View style={styles.taskSectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>부서별 업무 현황</Text>
              <Text style={[styles.sectionHint, { color: colors.muted }]}>
                업무 카드를 탭하면 상태가 변경됩니다
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addTaskBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddTaskModal(true)}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

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
                  const isManualTask = !task.checklistKey;
                  return (
                    <View key={task.id}>
                      <TouchableOpacity
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
                          {task.meetingId && (
                            <Text style={[styles.taskMeta, { color: colors.muted }]}>회의록 연동</Text>
                          )}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                          <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {isManualTask && (
                        <View style={styles.taskActions}>
                          <TouchableOpacity
                            onPress={() => handleEditTask(task)}
                            style={[styles.actionBtn, { backgroundColor: colors.primary + '12' }]}
                          >
                            <IconSymbol name="pencil" size={14} color={colors.primary} />
                            <Text style={[styles.actionBtnText, { color: colors.primary }]}>수정</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteTask(task.id)}
                            style={[styles.actionBtn, { backgroundColor: colors.error + '12' }]}
                          >
                            <IconSymbol name="trash" size={14} color={colors.error} />
                            <Text style={[styles.actionBtnText, { color: colors.error }]}>삭제</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
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

      {/* 업무 추가 모달 */}
      <Modal visible={showAddTaskModal} transparent animationType="slide" onRequestClose={() => setShowAddTaskModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>업무 추가</Text>
              <TouchableOpacity onPress={() => setShowAddTaskModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* 부서 선택 */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.foreground }]}>부서 선택</Text>
              <View style={styles.deptGrid}>
                {(Object.entries(DEPARTMENTS) as [Department, any][]).map(([key, dept]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.deptOption,
                      {
                        backgroundColor: selectedDept === key ? colors.primary + '20' : colors.surface,
                        borderColor: selectedDept === key ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedDept(key)}
                  >
                    <View style={[styles.deptOptionDot, { backgroundColor: dept.color }]} />
                    <Text
                      style={[
                        styles.deptOptionText,
                        { color: selectedDept === key ? colors.primary : colors.foreground },
                      ]}
                    >
                      {dept.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 업무 제목 입력 */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.foreground }]}>업무 제목</Text>
              <TextInput
                style={[styles.textInput, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="업무 제목을 입력하세요"
                placeholderTextColor={colors.muted}
                value={taskTitle}
                onChangeText={setTaskTitle}
                returnKeyType="done"
              />
            </View>

            {/* 버튼 */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowAddTaskModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleAddTask}>
                <Text style={styles.submitBtnText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 업무 수정 모달 */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>업무 수정</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* 부서 선택 */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.foreground }]}>부서 선택</Text>
              <View style={styles.deptGrid}>
                {(Object.entries(DEPARTMENTS) as [Department, any][]).map(([key, dept]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.deptOption,
                      {
                        backgroundColor: selectedDept === key ? colors.primary + '20' : colors.surface,
                        borderColor: selectedDept === key ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedDept(key)}
                  >
                    <View style={[styles.deptOptionDot, { backgroundColor: dept.color }]} />
                    <Text
                      style={[
                        styles.deptOptionText,
                        { color: selectedDept === key ? colors.primary : colors.foreground },
                      ]}
                    >
                      {dept.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 업무 제목 입력 */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: colors.foreground }]}>업무 제목</Text>
              <TextInput
                style={[styles.textInput, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="업무 제목을 입력하세요"
                placeholderTextColor={colors.muted}
                value={taskTitle}
                onChangeText={setTaskTitle}
                returnKeyType="done"
              />
            </View>

            {/* 버튼 */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleUpdateTask}>
                <Text style={styles.submitBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  deleteBtn: {
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
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 8,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  docButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  docBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  docBtnTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  docBtnSub: {
    fontSize: 11,
  },
  taskSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  taskSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionHint: {
    fontSize: 12,
    marginTop: 2,
  },
  addTaskBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptGroup: {
    marginBottom: 16,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  deptColorBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  deptName: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 8,
    gap: 10,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    marginLeft: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyTasks: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 16,
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
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  deptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deptOption: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  deptOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deptOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
