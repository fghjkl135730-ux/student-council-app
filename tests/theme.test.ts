import { describe, it, expect } from 'vitest';
import { THEMES, THEME_NAMES } from '../lib/themes';

describe('Color Themes', () => {
  it('should have 8 themes defined', () => {
    expect(THEME_NAMES.length).toBe(8);
  });

  it('should have all theme names in THEMES object', () => {
    THEME_NAMES.forEach((themeName) => {
      expect(THEMES[themeName]).toBeDefined();
    });
  });

  it('each theme should have required color properties', () => {
    THEME_NAMES.forEach((themeName) => {
      const theme = THEMES[themeName];
      expect(theme.name).toBeDefined();
      expect(theme.colors).toBeDefined();
      expect(theme.colors.primary).toBeDefined();
      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.surface).toBeDefined();
      expect(theme.colors.foreground).toBeDefined();
      expect(theme.colors.muted).toBeDefined();
      expect(theme.colors.border).toBeDefined();
      expect(theme.colors.success).toBeDefined();
      expect(theme.colors.warning).toBeDefined();
      expect(theme.colors.error).toBeDefined();
    });
  });

  it('spring theme should have spring colors', () => {
    const springTheme = THEMES.spring;
    expect(springTheme.name).toBe('봄');
    expect(springTheme.colors.primary).toMatch(/^#/);
  });

  it('summer theme should have summer colors', () => {
    const summerTheme = THEMES.summer;
    expect(summerTheme.name).toBe('여름');
    expect(summerTheme.colors.primary).toMatch(/^#/);
  });

  it('autumn theme should have autumn colors', () => {
    const autumnTheme = THEMES.autumn;
    expect(autumnTheme.name).toBe('가을');
    expect(autumnTheme.colors.primary).toMatch(/^#/);
  });

  it('winter theme should have winter colors', () => {
    const winterTheme = THEMES.winter;
    expect(winterTheme.name).toBe('겨울');
    expect(winterTheme.colors.primary).toMatch(/^#/);
  });

  it('pastel theme should have pastel colors', () => {
    const pastelTheme = THEMES.pastel;
    expect(pastelTheme.name).toBe('파스텔');
    expect(pastelTheme.colors.primary).toMatch(/^#/);
  });

  it('mute theme should have muted colors', () => {
    const muteTheme = THEMES.mute;
    expect(muteTheme.name).toBe('뮤트');
    expect(muteTheme.colors.primary).toMatch(/^#/);
  });

  it('bright theme should have bright colors', () => {
    const brightTheme = THEMES.bright;
    expect(brightTheme.name).toBe('브라이트');
    expect(brightTheme.colors.primary).toMatch(/^#/);
  });

  it('deep theme should have deep colors', () => {
    const deepTheme = THEMES.deep;
    expect(deepTheme.name).toBe('딥');
    expect(deepTheme.colors.primary).toMatch(/^#/);
  });

  it('all color values should be valid hex colors', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    THEME_NAMES.forEach((themeName) => {
      const theme = THEMES[themeName];
      Object.values(theme.colors).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });
});
