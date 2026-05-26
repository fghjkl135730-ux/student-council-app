import { ChecklistItemKey, Department } from './types';

// ===== 부서 정보 =====
export const DEPARTMENTS: Record<Department, { name: string; color: string; shortName: string }> = {
  president: { name: '회장', color: '#DC2626', shortName: '회장' },
  vice_president: { name: '부회장', color: '#EA580C', shortName: '부회장' },
  planning: { name: '기획부', color: '#4F6AF5', shortName: '기획' },
  pr: { name: '홍보부', color: '#EC4899', shortName: '홍보' },
  admin: { name: '사무부', color: '#F59E0B', shortName: '사무' },
  culture: { name: '문화체육부', color: '#10B981', shortName: '문화체육' },
  welfare: { name: '정책복지부', color: '#8B5CF6', shortName: '정책복지' },
};

// ===== 스마트 체크리스트 항목 =====
export const CHECKLIST_ITEMS: Record<
  ChecklistItemKey,
  {
    label: string;
    department: Department;
    taskTitle: string;
    autoRegisterFacility?: boolean;
  }
> = {
  plan_writing: {
    label: '기획안 작성',
    department: 'planning',
    taskTitle: '기획안 작성',
  },
  pr_material: {
    label: '홍보물 제작',
    department: 'pr',
    taskTitle: '홍보물 제작',
  },
  purchase: {
    label: '물품 구매 및 정산',
    department: 'admin',
    taskTitle: '물품 구매 및 정산',
  },
  venue_rental: {
    label: '장소 대여 신청',
    department: null as any,
    taskTitle: '장소 대여 신청',
    autoRegisterFacility: true,
  },
  equipment_setup: {
    label: '체육/문화 물품 세팅',
    department: 'culture',
    taskTitle: '체육/문화 물품 세팅',
  },
  welfare_survey: {
    label: '복지/만족도 조사 기획',
    department: 'welfare',
    taskTitle: '복지/만족도 조사 기획',
  },
};

// ===== 업무 상태 표시 =====
export const TASK_STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '대기', color: '#6B7280', bgColor: '#F3F4F6' },
  in_progress: { label: '진행중', color: '#F59E0B', bgColor: '#FEF3C7' },
  done: { label: '완료', color: '#10B981', bgColor: '#D1FAE5' },
};

// ===== 시설 대여 상태 표시 =====
export const FACILITY_STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  needed: { label: '대여 필요', color: '#EF4444', bgColor: '#FEE2E2' },
  applied: { label: '신청 완료', color: '#10B981', bgColor: '#D1FAE5' },
  cancelled: { label: '취소됨', color: '#6B7280', bgColor: '#F3F4F6' },
};
