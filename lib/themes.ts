/**
 * 8가지 색상 테마 정의
 * 각 테마는 일관된 색감으로 앱 전체에 적용됩니다
 */

export type ThemeName = 'spring' | 'summer' | 'autumn' | 'winter' | 'azure' | 'dream' | 'flutter' | 'pastel';

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
  // 봄: 따뜻한 코랄, 크림, 연한 복숭아
  spring: {
    name: '봄',
    colors: {
      primary: '#ffb5a7',
      background: '#fcd5ce',
      surface: '#f8edeb',
      foreground: '#6B4423',
      muted: '#A0705F',
      border: '#E8C9C0',
      success: '#22D3EE',
      warning: '#FBBF24',
      error: '#F87171',
    },
  },

  // 여름: 밝은 파랑, 하늘색, 연한 하늘색
  summer: {
    name: '여름',
    colors: {
      primary: '#0077b6',
      background: '#00b4d8',
      surface: '#90e0ef',
      foreground: '#0C4A6E',
      muted: '#64748B',
      border: '#BAE6FD',
      success: '#22D3EE',
      warning: '#FBBF24',
      error: '#FB7185',
    },
  },

  // 가을: 따뜻한 빨강, 주황, 노랑
  autumn: {
    name: '가을',
    colors: {
      primary: '#9f2d2d',
      background: '#c14c2f',
      surface: '#ffb452',
      foreground: '#5C1A1A',
      muted: '#78716C',
      border: '#E8B4A0',
      success: '#F59E0B',
      warning: '#DC2626',
      error: '#DC2626',
    },
  },

  // 겨울: 어두운 네이비, 슬레이트, 연한 회색
  winter: {
    name: '겨울',
    colors: {
      primary: '#0f172a',
      background: '#64748b',
      surface: '#e2e8f0',
      foreground: '#0F172A',
      muted: '#9CA3AF',
      border: '#CBD5E1',
      success: '#8B5CF6',
      warning: '#6366F1',
      error: '#EF4444',
    },
  },

  // 푸름: 밝은 민트, 초록, 진한 초록
  azure: {
    name: '푸름',
    colors: {
      primary: '#dcfce7',
      background: '#76c694',
      surface: '#398e58',
      foreground: '#1B4332',
      muted: '#52B788',
      border: '#95D5B2',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
    },
  },

  // 꿈결: 연한 보라, 연한 핑크, 밝은 핑크
  dream: {
    name: '꿈결',
    colors: {
      primary: '#7540bf',
      background: '#be82c9',
      surface: '#f2c0dd',
      foreground: '#4A1A5C',
      muted: '#B4B4B8',
      border: '#E8D5E8',
      success: '#86EFAC',
      warning: '#FCD34D',
      error: '#FCA5A5',
    },
  },

  // 설렘: 매우 밝은 핑크, 밝은 핑크, 따뜻한 핑크
  flutter: {
    name: '설렘',
    colors: {
      primary: '#fff0f3',
      background: '#ffccd5',
      surface: '#ff85a1',
      foreground: '#831843',
      muted: '#A1A1AA',
      border: '#FBCFE8',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },

  // 파스텔: 연한 핑크, 연한 노랑, 연한 민트
  pastel: {
    name: '파스텔',
    colors: {
      primary: '#ffccd5',
      background: '#fef08a',
      surface: '#dcfce7',
      foreground: '#6B4423',
      muted: '#B4B4B8',
      border: '#E8D5E8',
      success: '#86EFAC',
      warning: '#FCD34D',
      error: '#FCA5A5',
    },
  },
};

export const THEME_NAMES: ThemeName[] = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'azure',
  'dream',
  'flutter',
  'pastel',
];
