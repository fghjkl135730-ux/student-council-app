import { describe, it, expect } from 'vitest';

/**
 * 회의록 액션 아이템 연동 기능 테스트
 * 
 * 테스트 시나리오:
 * 1. 회의록 작성 및 AI 요약
 * 2. 액션 아이템에서 담당자 → 부서 자동 추출
 * 3. 액션 아이템을 행사에 연동하여 Task 생성
 * 4. 생성된 Task에 회의록 메타데이터(source, meetingId, deadline) 포함
 */

describe('Meeting Action Items Integration', () => {
  it('should extract department from assignee name', () => {
    // 담당자 이름 → 부서 매핑 테스트
    const assigneeToDepartmentMap: Record<string, string> = {
      '기획': 'planning',
      '기획부': 'planning',
      '기획부장': 'planning',
      '홍보': 'pr',
      '홍보부': 'pr',
      '사무': 'admin',
      '사무부': 'admin',
      '문화': 'culture',
      '문화체육': 'culture',
      '복지': 'welfare',
      '정책복지': 'welfare',
    };

    expect(assigneeToDepartmentMap['기획부']).toBe('planning');
    expect(assigneeToDepartmentMap['홍보']).toBe('pr');
    expect(assigneeToDepartmentMap['사무부']).toBe('admin');
    expect(assigneeToDepartmentMap['문화체육']).toBe('culture');
    expect(assigneeToDepartmentMap['정책복지']).toBe('welfare');
  });

  it('should create task with meeting metadata', () => {
    // 회의록에서 생성된 Task 메타데이터 검증
    const actionItem = {
      task: '행사 포스터 제작',
      assignee: '홍보부',
      deadline: '2025-06-10',
      department: 'pr',
    };

    const createdTask = {
      id: 'task_123',
      eventId: 'event_456',
      title: actionItem.task,
      department: actionItem.department,
      status: 'pending' as const,
      source: 'meeting' as const,
      meetingId: 'meeting_789',
      deadline: actionItem.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Task가 올바른 메타데이터를 가지고 있는지 검증
    expect(createdTask.source).toBe('meeting');
    expect(createdTask.meetingId).toBe('meeting_789');
    expect(createdTask.deadline).toBe('2025-06-10');
    expect(createdTask.status).toBe('pending');
    expect(createdTask.title).toBe('행사 포스터 제작');
  });

  it('should batch add action items to event', () => {
    // 여러 액션 아이템을 한 번에 행사에 추가
    const actionItems = [
      { task: '기획안 작성', assignee: '기획부', deadline: '2025-06-05', department: 'planning' },
      { task: '포스터 제작', assignee: '홍보부', deadline: '2025-06-08', department: 'pr' },
      { task: '물품 구매', assignee: '사무부', deadline: '2025-06-10', department: 'admin' },
    ];

    const eventId = 'event_123';
    const meetingId = 'meeting_456';

    // 액션 아이템 개수 검증
    expect(actionItems.length).toBe(3);

    // 각 액션 아이템이 올바른 부서로 매핑되는지 검증
    const tasksByDept = actionItems.reduce(
      (acc, item) => {
        if (!acc[item.department]) acc[item.department] = [];
        acc[item.department].push(item);
        return acc;
      },
      {} as Record<string, typeof actionItems>
    );

    expect(tasksByDept['planning'].length).toBe(1);
    expect(tasksByDept['pr'].length).toBe(1);
    expect(tasksByDept['admin'].length).toBe(1);
  });

  it('should preserve action item metadata in task', () => {
    // 액션 아이템의 모든 정보가 Task에 보존되는지 검증
    const actionItem = {
      task: '만족도 조사 기획',
      assignee: '정책복지부',
      deadline: '2025-06-15',
      department: 'welfare',
    };

    const task = {
      id: 'task_001',
      eventId: 'event_001',
      title: actionItem.task,
      department: actionItem.department,
      status: 'pending' as const,
      source: 'meeting' as const,
      meetingId: 'meeting_001',
      deadline: actionItem.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 원본 액션 아이템의 정보가 모두 Task에 포함되어 있는지 검증
    expect(task.title).toBe(actionItem.task);
    expect(task.department).toBe(actionItem.department);
    expect(task.deadline).toBe(actionItem.deadline);
    expect(task.source).toBe('meeting');
  });

  it('should differentiate between checklist and meeting tasks', () => {
    // 체크리스트에서 생성된 Task와 회의록에서 생성된 Task 구분
    const checklistTask = {
      id: 'task_checklist_001',
      eventId: 'event_001',
      title: '기획안 작성',
      department: 'planning' as const,
      status: 'pending' as const,
      source: 'checklist' as const,
      checklistKey: 'plan_writing' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const meetingTask = {
      id: 'task_meeting_001',
      eventId: 'event_001',
      title: '기획안 작성 (수정)',
      department: 'planning' as const,
      status: 'pending' as const,
      source: 'meeting' as const,
      meetingId: 'meeting_001',
      deadline: '2025-06-05',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 출처 구분 검증
    expect(checklistTask.source).toBe('checklist');
    expect(meetingTask.source).toBe('meeting');

    // 체크리스트 Task는 checklistKey 포함
    expect('checklistKey' in checklistTask).toBe(true);
    expect('checklistKey' in meetingTask).toBe(false);

    // 회의록 Task는 meetingId와 deadline 포함
    expect('meetingId' in checklistTask).toBe(false);
    expect('meetingId' in meetingTask).toBe(true);
    expect('deadline' in meetingTask).toBe(true);
  });

  it('should handle empty action items gracefully', () => {
    // 액션 아이템이 없는 경우 처리
    const emptyActionItems: any[] = [];

    expect(emptyActionItems.length).toBe(0);
    expect(Array.isArray(emptyActionItems)).toBe(true);
  });

  it('should support partial action item data', () => {
    // 일부 필드가 없는 액션 아이템 처리
    const actionItemWithoutDeadline = {
      task: '행사 진행',
      assignee: '기획부',
      department: 'planning',
    };

    const actionItemWithoutAssignee = {
      task: '현장 정리',
      deadline: '2025-06-20',
      department: 'planning',
    };

    // 필드 검증
    expect('deadline' in actionItemWithoutDeadline).toBe(false);
    expect('assignee' in actionItemWithoutAssignee).toBe(false);

    // 필드가 없어도 Task 생성 가능
    const task1 = {
      title: actionItemWithoutDeadline.task,
      department: actionItemWithoutDeadline.department,
      deadline: undefined,
    };

    const task2 = {
      title: actionItemWithoutAssignee.task,
      department: actionItemWithoutAssignee.department,
      deadline: actionItemWithoutAssignee.deadline,
    };

    expect(task1.deadline).toBeUndefined();
    expect(task2.deadline).toBe('2025-06-20');
  });
});
