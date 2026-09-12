import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ThemeService } from '../core/theme.service';
import { SvgIconComponent } from './svg-icon.component';

@Component({
  selector: 'app-theme-toggle',
  imports: [TranslocoPipe, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="global-theme-toggle"
      type="button"
      [attr.aria-label]="labelKey() | transloco"
      [attr.title]="labelKey() | transloco"
      [attr.aria-pressed]="isDark()"
      (click)="toggleTheme()"
    >
      <span class="theme-toggle-orbit" aria-hidden="true"></span>
      <span class="theme-toggle-icon" aria-hidden="true">
        <app-icon [name]="isDark() ? 'sun' : 'moon'" [size]="21" />
      </span>
    </button>
  `,
})
export class ThemeToggleComponent implements OnDestroy {
  private readonly systemThemeQuery = this.createSystemThemeQuery();
  private readonly systemDark = signal(Boolean(this.systemThemeQuery?.matches));

  readonly isDark = computed(() => {
    const preference = this.theme.preference();
    return preference === 'dark' || (preference === 'system' && this.systemDark());
  });
  readonly labelKey = computed(() => (this.isDark() ? 'theme.toLight' : 'theme.toDark'));

  private readonly onSystemThemeChange = (event: MediaQueryListEvent): void => {
    this.systemDark.set(event.matches);
  };

  constructor(readonly theme: ThemeService) {
    this.systemThemeQuery?.addEventListener('change', this.onSystemThemeChange);
  }

  toggleTheme(): void {
    this.theme.set(this.isDark() ? 'light' : 'dark');
  }

  ngOnDestroy(): void {
    this.systemThemeQuery?.removeEventListener('change', this.onSystemThemeChange);
  }

  private createSystemThemeQuery(): MediaQueryList | undefined {
    return typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : undefined;
  }
}
