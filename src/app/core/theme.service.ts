import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { ThemePreference } from '../models/domain.models';

const THEME_KEY = 'solventa.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly preference = signal<ThemePreference>(
    (localStorage.getItem(THEME_KEY) as ThemePreference | null) ?? 'system',
  );

  constructor() {
    effect(() => {
      const value = this.preference();
      localStorage.setItem(THEME_KEY, value);
      this.document.documentElement.dataset['theme'] = value;
    });
  }

  set(value: ThemePreference): void {
    this.preference.set(value);
  }
}
