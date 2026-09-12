import { signal } from '@angular/core';
import { ThemeService } from '../core/theme.service';
import { ThemePreference } from '../models/domain.models';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  it('toggles directly between light and dark preferences', () => {
    const preference = signal<ThemePreference>('light');
    const theme = {
      preference,
      set: (value: ThemePreference) => preference.set(value),
    } as ThemeService;
    const component = new ThemeToggleComponent(theme);

    expect(component.isDark()).toBe(false);
    expect(component.labelKey()).toBe('theme.toDark');

    component.toggleTheme();
    expect(preference()).toBe('dark');
    expect(component.isDark()).toBe(true);
    expect(component.labelKey()).toBe('theme.toLight');

    component.toggleTheme();
    expect(preference()).toBe('light');
    expect(component.isDark()).toBe(false);
    component.ngOnDestroy();
  });
});
