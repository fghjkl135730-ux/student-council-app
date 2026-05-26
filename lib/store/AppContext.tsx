import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Event,
  Task,
  FacilityRental,
  Meeting,
  PlanDocument,
  ReportDocument,
  ChecklistItemKey,
  TaskStatus,
  FacilityStatus,
  Department,
} from '../types';
import { CHECKLIST_ITEMS } from '../constants';

// ===== 상태 타입 =====
interface AppState {
  events: Event[];
  facilities: FacilityRental[];
  meetings: Meeting[];
  isLoading: boolean;
}

// ===== 액션 타입 =====
type AppAction =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'UPDATE_TASK_STATUS'; payload: { eventId: string; taskId: string; status: TaskStatus } }
  | { type: 'UPDATE_PLAN_DOC'; payload: { eventId: string; doc: PlanDocument } }
  | { type: 'UPDATE_REPORT_DOC'; payload: { eventId: string; doc: ReportDocument } }
  | { type: 'ADD_FACILITY'; payload: FacilityRental }
  | { type: 'UPDATE_FACILITY_STATUS'; payload: { facilityId: string; status: FacilityStatus } }
  | { type: 'DELETE_FACILITY'; payload: string }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'UPDATE_MEETING'; payload: Meeting }
  | { type: 'DELETE_MEETING'; payload: string }
  | { type: 'ADD_ACTION_ITEMS_TO_EVENT'; payload: { eventId: string; meetingId: string; actionItems: Array<{ task: string; assignee: string; deadline?: string; department?: string }> } }
  | { type: 'ADD_TASK_TO_EVENT'; payload: { eventId: string; taskData: { title: string; department: Department } } }
  | { type: 'SET_LOADING'; payload: boolean };

// ===== 리듀서 =====
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, isLoading: false };

    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.payload.id ? action.payload : e)),
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
        facilities: state.facilities.filter((f) => f.eventId !== action.payload),
      };

    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        events: state.events.map((e) => {
          if (e.id !== action.payload.eventId) return e;
          return {
            ...e,
            tasks: e.tasks.map((t) =>
              t.id === action.payload.taskId
                ? { ...t, status: action.payload.status, updatedAt: new Date().toISOString() }
                : t
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      };

    case 'UPDATE_PLAN_DOC':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.eventId ? { ...e, planDoc: action.payload.doc, updatedAt: new Date().toISOString() } : e
        ),
      };

    case 'UPDATE_REPORT_DOC':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.eventId ? { ...e, reportDoc: action.payload.doc, updatedAt: new Date().toISOString() } : e
        ),
      };

    case 'ADD_FACILITY':
      return { ...state, facilities: [action.payload, ...state.facilities] };

    case 'UPDATE_FACILITY_STATUS':
      return {
        ...state,
        facilities: state.facilities.map((f) =>
          f.id === action.payload.facilityId
            ? { ...f, status: action.payload.status, updatedAt: new Date().toISOString() }
            : f
        ),
      };

    case 'DELETE_FACILITY':
      return { ...state, facilities: state.facilities.filter((f) => f.id !== action.payload) };

    case 'ADD_MEETING':
      return { ...state, meetings: [action.payload, ...state.meetings] };

    case 'UPDATE_MEETING':
      return {
        ...state,
        meetings: state.meetings.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };

    case 'DELETE_MEETING':
      return { ...state, meetings: state.meetings.filter((m) => m.id !== action.payload) };

    case 'ADD_ACTION_ITEMS_TO_EVENT': {
      const { eventId, meetingId, actionItems } = action.payload;
      return {
        ...state,
        events: state.events.map((e) => {
          if (e.id !== eventId) return e;
          const newTasks: Task[] = actionItems.map((item) => ({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            eventId,
            title: item.task,
            department: (item.department as Department) || 'planning',
            status: 'pending' as const,
            source: 'meeting' as const,
            meetingId,
            deadline: item.deadline,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          return {
            ...e,
            tasks: [...e.tasks, ...newTasks],
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    case 'ADD_TASK_TO_EVENT': {
      const { eventId, taskData } = action.payload;
      return {
        ...state,
        events: state.events.map((e) => {
          if (e.id !== eventId) return e;
          const newTask: Task = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            eventId,
            title: taskData.title,
            department: taskData.department,
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...e,
            tasks: [...e.tasks, newTask],
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ===== 초기 상태 =====
const initialState: AppState = {
  events: [],
  facilities: [],
  meetings: [],
  isLoading: true,
};

// ===== Context =====
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 헬퍼 함수들
  createEvent: (data: {
    name: string;
    date: string;
    time: string;
    location: string;
    checklist: ChecklistItemKey[];
  }) => void;
  updateTaskStatus: (eventId: string, taskId: string, status: TaskStatus) => void;
  updateFacilityStatus: (facilityId: string, status: FacilityStatus) => void;
  savePlanDoc: (eventId: string, doc: PlanDocument) => void;
  saveReportDoc: (eventId: string, doc: ReportDocument) => void;
  deleteEvent: (eventId: string) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;
  addActionItemsToEvent: (eventId: string, meetingId: string, actionItems: Array<{ task: string; assignee: string; deadline?: string; department?: string }>) => void;
  addTaskToEvent: (eventId: string, taskData: { title: string; department: Department }) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ===== AsyncStorage 키 =====
const STORAGE_KEY = 'student_council_app_state';

// ===== UUID 생성 =====
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== Provider =====
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 앱 시작 시 AsyncStorage에서 로드
  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadState();
  }, []);

  // 상태 변경 시 AsyncStorage에 저장
  useEffect(() => {
    if (!state.isLoading) {
      const saveState = async () => {
        try {
          const toSave = {
            events: state.events,
            facilities: state.facilities,
            meetings: state.meetings,
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch {
          // 저장 실패 무시
        }
      };
      saveState();
    }
  }, [state.events, state.facilities, state.meetings, state.isLoading]);

  // ===== 헬퍼 함수들 =====
  const createEvent = useCallback(
    (data: { name: string; date: string; time: string; location: string; checklist: ChecklistItemKey[] }) => {
      const now = new Date().toISOString();
      const eventId = generateId();

      // 업무 자동 생성
      const tasks: Task[] = data.checklist.map((key) => {
        const item = CHECKLIST_ITEMS[key];
        return {
          id: generateId(),
          eventId,
          title: item.taskTitle,
          department: item.department,
          status: 'pending' as const,
          checklistKey: key,
          createdAt: now,
          updatedAt: now,
        };
      });

      const event: Event = {
        id: eventId,
        name: data.name,
        date: data.date,
        time: data.time,
        location: data.location,
        checklist: data.checklist,
        tasks,
        createdAt: now,
        updatedAt: now,
      };

      dispatch({ type: 'ADD_EVENT', payload: event });

      // 장소 대여 자동 등록
      if (data.checklist.includes('venue_rental')) {
        const facility: FacilityRental = {
          id: generateId(),
          eventId,
          eventName: data.name,
          location: data.location,
          date: data.date,
          time: data.time,
          status: 'needed',
          createdAt: now,
          updatedAt: now,
        };
        dispatch({ type: 'ADD_FACILITY', payload: facility });
      }
    },
    []
  );

  const updateTaskStatus = useCallback((eventId: string, taskId: string, status: TaskStatus) => {
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { eventId, taskId, status } });
  }, []);

  const updateFacilityStatus = useCallback((facilityId: string, status: FacilityStatus) => {
    dispatch({ type: 'UPDATE_FACILITY_STATUS', payload: { facilityId, status } });
  }, []);

  const savePlanDoc = useCallback((eventId: string, doc: PlanDocument) => {
    dispatch({ type: 'UPDATE_PLAN_DOC', payload: { eventId, doc } });
  }, []);

  const saveReportDoc = useCallback((eventId: string, doc: ReportDocument) => {
    dispatch({ type: 'UPDATE_REPORT_DOC', payload: { eventId, doc } });
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: eventId });
  }, []);

  const addMeeting = useCallback((meeting: Meeting) => {
    dispatch({ type: 'ADD_MEETING', payload: meeting });
  }, []);

  const updateMeeting = useCallback((meeting: Meeting) => {
    dispatch({ type: 'UPDATE_MEETING', payload: meeting });
  }, []);

  const deleteMeeting = useCallback((id: string) => {
    dispatch({ type: 'DELETE_MEETING', payload: id });
  }, []);

  const addActionItemsToEvent = useCallback(
    (eventId: string, meetingId: string, actionItems: Array<{ task: string; assignee: string; deadline?: string; department?: string }>) => {
      dispatch({ type: 'ADD_ACTION_ITEMS_TO_EVENT', payload: { eventId, meetingId, actionItems } });
    },
    []
  );

  const addTaskToEvent = useCallback(
    (eventId: string, taskData: { title: string; department: Department }) => {
      dispatch({ type: 'ADD_TASK_TO_EVENT', payload: { eventId, taskData } });
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        createEvent,
        updateTaskStatus,
        updateFacilityStatus,
        savePlanDoc,
        saveReportDoc,
        deleteEvent,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        addActionItemsToEvent,
        addTaskToEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ===== Hook =====
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
