// ===== 부서 타입 =====
export type Department =
  | 'planning'    // 기획부
  | 'pr'          // 홍보부
  | 'admin'       // 사무부
  | 'culture'     // 문화체육부
  | 'welfare';    // 정책복지부

// ===== 업무 상태 =====
export type TaskStatus = 'pending' | 'in_progress' | 'done';

// ===== 시설 대여 상태 =====
export type FacilityStatus = 'needed' | 'applied' | 'cancelled';

// ===== 스마트 체크리스트 항목 =====
export type ChecklistItemKey =
  | 'plan_writing'       // 기획안 작성 (기획부)
  | 'pr_material'        // 홍보물 제작 (홍보부)
  | 'purchase'           // 물품 구매 및 정산 (사무부)
  | 'venue_rental'       // 장소 대여 신청 (기획부 + 시설대여 자동등록)
  | 'equipment_setup'    // 체육/문화 물품 세팅 (문화체육부)
  | 'welfare_survey';    // 복지/만족도 조사 기획 (정책복지부)

// ===== 업무 (Task) =====
export interface Task {
  id: string;
  eventId: string;
  title: string;
  department: Department;
  status: TaskStatus;
  checklistKey?: ChecklistItemKey;  // 스마트 체크리스트에서 생성된 경우만 존재
  source?: 'checklist' | 'meeting';  // 출처: 체크리스트 또는 회의록
  meetingId?: string;  // 회의록에서 생성된 경우 회의록 ID
  deadline?: string;  // 기한 (회의록 액션 아이템에서 추출)
  createdAt: string; // ISO string
  updatedAt: string;
}

// ===== 행사 (Event) =====
export interface Event {
  id: string;
  name: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  location: string;
  checklist: ChecklistItemKey[];
  tasks: Task[];
  planDoc?: PlanDocument;
  reportDoc?: ReportDocument;
  createdAt: string;
  updatedAt: string;
}

// ===== 기획안 문서 =====
export interface PlanDocument {
  id: string;
  eventId: string;
  overview: string;         // 행사 개요
  programs: ProgramItem[];  // 세부 프로그램
  notes: string;            // 기타 사항
  updatedAt: string;
}

export interface ProgramItem {
  id: string;
  time: string;
  activity: string;
  person: string;
  notes: string;
}

// ===== 사무보고서 문서 =====
export interface ReportDocument {
  id: string;
  eventId: string;
  purchaseItems: PurchaseItem[];
  specialNotes: string;
  photoChecklist: {
    receipt: boolean;
    items: boolean;
    event: boolean;
  };
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
}

// ===== 시설 대여 =====
export interface FacilityRental {
  id: string;
  eventId: string;
  eventName: string;
  location: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  status: FacilityStatus;
  createdAt: string;
  updatedAt: string;
}

// ===== 회의록 =====
export interface Meeting {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  content: string;    // 원본 회의록
  summary?: MeetingSummary;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSummary {
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  generatedAt: string;
}

export interface ActionItem {
  task: string;
  assignee: string;
  deadline?: string;
}
