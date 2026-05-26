/**
 * 8가지 색상 테마 정의
 * 각 테마는 일관된 색감으로 앱 전체에 적용됩니다
 */

export type ThemeName = 'spring' | 'summer' | 'autumn' | 'winter' | 'pastel' | 'mute' | 'bright' | 'deep';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export const THEMES: Record<ThemeName, { name: string; colors: ThemeColors }> = {
  // 봄: 신선하고 밝은 초록, 핑크, 하늘색
  spring: {
    name: '봄',
    colors: {
      primary: '#10B981', // 신선한 초록
      background: '#FFFFFF',
      surface: '#F0FDF4', // 밝은 민트
      foreground: '#065F46',
      muted: '#6B7280',
      border: '#D1FAE5', // 연한 민트
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
    },
  },

  // 여름: 밝고 생생한 파랑, 노랑, 주황
  summer: {
    name: '여름',
    colors: {
      primary: '#0EA5E9', // 밝은 하늘색
      background: '#FFFFFF',
      surface: '#F0F9FF', // 매우 밝은 파랑
      foreground: '#0C4A6E',
      muted: '#64748B',
      border: '#BAE6FD', // 연한 파랑
      success: '#22D3EE',
      warning: '#FBBF24',
      error: '#FB7185',
    },
  },

  // 가을: 따뜻한 주황, 갈색, 빨강
  autumn: {
    name: '가을',
    colors: {
      primary: '#EA580C', // 따뜻한 주황
      background: '#FFFFFF',
      surface: '#FEF3C7', // 밝은 노랑
      foreground: '#92400E',
      muted: '#78716C',
      border: '#FED7AA', // 연한 주황
      success: '#F59E0B',
      warning: '#DC2626',
      error: '#DC2626',
    },
  },

  // 겨울: 차가운 파랑, 보라, 회색
  winter: {
    name: '겨울',
    colors: {
      primary: '#6366F1', // 차가운 보라
      background: '#FFFFFF',
      surface: '#F3F4F6', // 밝은 회색
      foreground: '#1E293B',
      muted: '#9CA3AF',
      border: '#E5E7EB', // 연한 회색
      success: '#8B5CF6',
      warning: '#6366F1',
      error: '#EF4444',
    },
  },

  // 파스텔: 부드럽고 연한 색감
  pastel: {
    name: '파스텔',
    colors: {
      primary: '#F472B6', // 연한 핑크
      background: '#FFFFFF',
      surface: '#FCE7F3', // 매우 연한 핑크
      foreground: '#831843',
      muted: '#B4B4B8',
      border: '#FBCFE8', // 매우 연한 핑크
      success: '#86EFAC',
      warning: '#FCD34D',
      error: '#FCA5A5',
    },
  },

  // 뮤트: 차분하고 고급스러운 색감
  mute: {
    name: '뮤트',
    colors: {
      primary: '#8B7355', // 뮤트 브라운
      background: '#FFFFFF',
      surface: '#F5F3F0', // 매우 밝은 베이지
      foreground: '#3F3F46',
      muted: '#A1A1AA',
      border: '#E7E5E4', // 연한 베이지
      success: '#78716C',
      warning: '#A16207',
      error: '#991B1B',
    },
  },

  // 브라이트: 강렬하고 생생한 색감
  bright: {
    name: '브라이트',
    colors: {
      primary: '#EC4899', // 생생한 핑크
      background: '#FFFFFF',
      surface: '#FDF2F8', // 매우 밝은 핑크
      foreground: '#831843',
      muted: '#6B7280',
      border: '#FBCFE8', // 연한 핑크
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },

  // 딥: 어두운 고급스러운 색감
  deep: {
    name: '딥',
    colors: {
      primary: '#7C3AED', // 진한 보라
      background: '#FFFFFF',
      surface: '#F3E8FF', // 매우 밝은 보라
      foreground: '#2E1065',
      muted: '#6B7280',
      border: '#E9D5FF', // 연한 보라
      success: '#6366F1',
      warning: '#DC2626',
      error: '#991B1B',
    },
  },
};

export const THEME_NAMES: ThemeName[] = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'pastel',
  'mute',
  'bright',
  'deep',
];
