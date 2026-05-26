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
    expect(springTheme.colors.primary).toBe('#ffb5a7');
    expect(springTheme.colors.background).toBe('#fcd5ce');
    expect(springTheme.colors.surface).toBe('#f8edeb');
  });

  it('summer theme should have summer colors', () => {
    const summerTheme = THEMES.summer;
    expect(summerTheme.name).toBe('여름');
    expect(summerTheme.colors.primary).toBe('#0077b6');
    expect(summerTheme.colors.background).toBe('#00b4d8');
    expect(summerTheme.colors.surface).toBe('#90e0ef');
  });

  it('autumn theme should have autumn colors', () => {
    const autumnTheme = THEMES.autumn;
    expect(autumnTheme.name).toBe('가을');
    expect(autumnTheme.colors.primary).toBe('#9f2d2d');
    expect(autumnTheme.colors.background).toBe('#c14c2f');
    expect(autumnTheme.colors.surface).toBe('#ffb452');
  });

  it('winter theme should have winter colors', () => {
    const winterTheme = THEMES.winter;
    expect(winterTheme.name).toBe('겨울');
    expect(winterTheme.colors.primary).toBe('#0f172a');
    expect(winterTheme.colors.background).toBe('#64748b');
    expect(winterTheme.colors.surface).toBe('#e2e8f0');
  });

  it('azure theme should have azure colors', () => {
    const azureTheme = THEMES.azure;
    expect(azureTheme.name).toBe('푸름');
    expect(azureTheme.colors.primary).toBe('#dcfce7');
    expect(azureTheme.colors.background).toBe('#76c694');
    expect(azureTheme.colors.surface).toBe('#398e58');
  });

  it('dream theme should have dream colors', () => {
    const dreamTheme = THEMES.dream;
    expect(dreamTheme.name).toBe('꿈결');
    expect(dreamTheme.colors.primary).toBe('#7540bf');
    expect(dreamTheme.colors.background).toBe('#be82c9');
    expect(dreamTheme.colors.surface).toBe('#f2c0dd');
  });

  it('flutter theme should have flutter colors', () => {
    const flutterTheme = THEMES.flutter;
    expect(flutterTheme.name).toBe('설렘');
    expect(flutterTheme.colors.primary).toBe('#fff0f3');
    expect(flutterTheme.colors.background).toBe('#ffccd5');
    expect(flutterTheme.colors.surface).toBe('#ff85a1');
  });

  it('pastel theme should have pastel colors', () => {
    const pastelTheme = THEMES.pastel;
    expect(pastelTheme.name).toBe('파스텔');
    expect(pastelTheme.colors.primary).toBe('#ffccd5');
    expect(pastelTheme.colors.background).toBe('#fef08a');
    expect(pastelTheme.colors.surface).toBe('#dcfce7');
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
