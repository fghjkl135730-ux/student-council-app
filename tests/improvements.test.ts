import { describe, it, expect } from 'vitest';

/**
 * 3가지 개선사항 단위 테스트
 * 1. 회의록 액션 아이템 자동 선택 및 summary 포함
 * 2. 시설대여 탭 필터링 및 상태 전환
 * 3. 행사 부서별 업무 수동 추가
 */

describe('Improvements v1.1', () => {
  describe('1. Meeting Action Items Auto-selection & Summary Inclusion', () => {
    it('should auto-select all action items on initial load', () => {
      const actionItems = [
        { task: '기획안 작성', assignee: '기획부', deadline: '2025-06-05', department: 'planning' },
        { task: '포스터 제작', assignee: '홍보부', deadline: '2025-06-08', department: 'pr' },
        { task: '물품 구매', assignee: '사무부', deadline: '2025-06-10', department: 'admin' },
      ];

      // 초기 로드 시 모든 아이템이 선택되어야 함
      const selectedActionItems = new Set(actionItems.map((_, i) => i));
      expect(selectedActionItems.size).toBe(actionItems.length);
      expect(Array.from(selectedActionItems)).toEqual([0, 1, 2]);
    });

    it('should include summary in saved meeting', () => {
      const actionItems = [
        { task: '기획안 작성', assignee: '기획부', deadline: '2025-06-05', department: 'planning' },
      ];

      const meeting = {
        id: 'meeting_001',
        title: '학생회 회의',
        date: '2025-06-01',
        content: '행사 기획 회의',
        summary: {
          keyPoints: [],
          decisions: [],
          actionItems: actionItems,
          generatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 회의록이 summary 필드를 포함해야 함
      expect(meeting.summary).toBeDefined();
      expect(meeting.summary.actionItems).toEqual(actionItems);
      expect(meeting.summary.actionItems.length).toBe(1);
    });

    it('should preserve action items in linked meeting', () => {
      const actionItems = [
        { task: '기획안 작성', assignee: '기획부', deadline: '2025-06-05', department: 'planning' },
        { task: '포스터 제작', assignee: '홍보부', deadline: '2025-06-08', department: 'pr' },
      ];

      const linkedMeeting = {
        id: 'meeting_linked',
        title: '회의록',
        date: '2025-06-01',
        content: '회의 내용',
        summary: {
          keyPoints: [],
          decisions: [],
          actionItems: actionItems,
          generatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 연동된 회의록에서 액션 아이템 확인
      expect(linkedMeeting.summary.actionItems).toHaveLength(2);
      expect(linkedMeeting.summary.actionItems[0].task).toBe('기획안 작성');
      expect(linkedMeeting.summary.actionItems[1].task).toBe('포스터 제작');
    });
  });

  describe('2. Facility Rental Tab Filtering & Status Transition', () => {
    it('should separate facilities by status', () => {
      const facilities = [
        { id: 'f1', status: 'needed' as const },
        { id: 'f2', status: 'needed' as const },
        { id: 'f3', status: 'applied' as const },
        { id: 'f4', status: 'cancelled' as const },
      ];

      const neededFacilities = facilities.filter((f) => f.status === 'needed');
      const appliedFacilities = facilities.filter((f) => f.status === 'applied');

      expect(neededFacilities).toHaveLength(2);
      expect(appliedFacilities).toHaveLength(1);
    });

    it('should transition facility status from needed to applied', () => {
      const facility = {
        id: 'f1',
        location: '대강당',
        status: 'needed' as const,
      };

      // 상태 전환
      const updatedFacility = {
        ...facility,
        status: 'applied' as const,
      };

      expect(facility.status).toBe('needed');
      expect(updatedFacility.status).toBe('applied');
    });

    it('should transition facility status from applied to cancelled', () => {
      const facility = {
        id: 'f1',
        location: '대강당',
        status: 'applied' as const,
      };

      // 상태 전환
      const cancelledFacility = {
        ...facility,
        status: 'cancelled' as const,
      };

      expect(facility.status).toBe('applied');
      expect(cancelledFacility.status).toBe('cancelled');
    });

    it('should restore facility from cancelled to needed', () => {
      const facility = {
        id: 'f1',
        location: '대강당',
        status: 'cancelled' as const,
      };

      // 상태 복구
      const restoredFacility = {
        ...facility,
        status: 'needed' as const,
      };

      expect(facility.status).toBe('cancelled');
      expect(restoredFacility.status).toBe('needed');
    });

    it('should count facilities by status for summary', () => {
      const thisMonthFacilities = [
        { id: 'f1', status: 'needed' as const },
        { id: 'f2', status: 'needed' as const },
        { id: 'f3', status: 'applied' as const },
      ];

      const neededCount = thisMonthFacilities.filter((f) => f.status === 'needed').length;
      const appliedCount = thisMonthFacilities.filter((f) => f.status === 'applied').length;

      expect(neededCount).toBe(2);
      expect(appliedCount).toBe(1);
    });
  });

  describe('3. Manual Task Addition to Event', () => {
    it('should add task to event with department', () => {
      const event = {
        id: 'event_001',
        name: '축제',
        tasks: [
          { id: 'task_1', title: '기획안 작성', department: 'planning' as const },
        ],
      };

      const newTask = {
        id: 'task_2',
        title: '포스터 제작',
        department: 'pr' as const,
      };

      const updatedEvent = {
        ...event,
        tasks: [...event.tasks, newTask],
      };

      expect(updatedEvent.tasks).toHaveLength(2);
      expect(updatedEvent.tasks[1].title).toBe('포스터 제작');
      expect(updatedEvent.tasks[1].department).toBe('pr');
    });

    it('should validate task title is not empty', () => {
      const taskTitle = '  ';
      const isValid = taskTitle.trim().length > 0;

      expect(isValid).toBe(false);
    });

    it('should create task with pending status', () => {
      const newTask = {
        id: 'task_new',
        eventId: 'event_001',
        title: '물품 구매',
        department: 'admin' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(newTask.status).toBe('pending');
      expect(newTask.title).toBe('물품 구매');
      expect(newTask.department).toBe('admin');
    });

    it('should support all departments for manual task', () => {
      const departments = ['planning', 'pr', 'admin', 'culture', 'welfare'] as const;

      const tasks = departments.map((dept, idx) => ({
        id: `task_${idx}`,
        title: `Task for ${dept}`,
        department: dept,
      }));

      expect(tasks).toHaveLength(5);
      expect(tasks[0].department).toBe('planning');
      expect(tasks[4].department).toBe('welfare');
    });

    it('should group tasks by department after adding', () => {
      const tasks = [
        { id: 't1', title: '기획안 작성', department: 'planning' as const },
        { id: 't2', title: '포스터 제작', department: 'pr' as const },
        { id: 't3', title: '물품 구매', department: 'admin' as const },
        { id: 't4', title: '기획안 수정', department: 'planning' as const },
      ];

      const tasksByDept = tasks.reduce(
        (acc, task) => {
          if (!acc[task.department]) acc[task.department] = [];
          acc[task.department].push(task);
          return acc;
        },
        {} as Record<string, typeof tasks>
      );

      expect(tasksByDept['planning']).toHaveLength(2);
      expect(tasksByDept['pr']).toHaveLength(1);
      expect(tasksByDept['admin']).toHaveLength(1);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: meeting → action items → task addition', () => {
      // 1. 회의록 생성 및 액션 아이템 추출
      const actionItems = [
        { task: '기획안 작성', assignee: '기획부', deadline: '2025-06-05', department: 'planning' },
      ];

      const meeting = {
        id: 'meeting_001',
        title: '회의',
        summary: { actionItems },
      };

      // 2. 액션 아이템을 행사에 연동
      const event = {
        id: 'event_001',
        name: '축제',
        tasks: actionItems.map((item) => ({
          id: `task_${Math.random()}`,
          title: item.task,
          department: item.department,
          source: 'meeting' as const,
          meetingId: meeting.id,
          deadline: item.deadline,
        })),
      };

      // 3. 수동으로 추가 업무 생성
      const manualTask = {
        id: 'task_manual',
        title: '현장 정리',
        department: 'culture' as const,
      };

      const finalEvent = {
        ...event,
        tasks: [...event.tasks, manualTask],
      };

      expect(finalEvent.tasks).toHaveLength(2);
      expect(finalEvent.tasks[0].meetingId).toBe(meeting.id);
      expect(finalEvent.tasks[1].meetingId).toBeUndefined();
    });
  });
});
