import { Component, input, output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-simulation-notice',
  imports: [TranslocoPipe],
  template: `<div class="simulation-notice" role="note">
    <span aria-hidden="true">ⓘ</span><span>{{ 'common.simulated' | transloco }}</span>
  </div>`,
})
export class SimulationNoticeComponent {}

@Component({
  selector: 'app-loading-state',
  imports: [MatProgressSpinnerModule, TranslocoPipe],
  template: `<div class="state-card" role="status">
    <mat-spinner diameter="34" />
    <p>{{ labelKey() | transloco }}</p>
  </div>`,
})
export class LoadingStateComponent {
  readonly labelKey = input('common.loading');
}

@Component({
  selector: 'app-error-state',
  imports: [TranslocoPipe],
  template: `<div class="state-card error-card" role="alert">
    <div class="state-icon" aria-hidden="true">!</div>
    <p>{{ messageKey() | transloco }}</p>
    <button class="button secondary" type="button" (click)="retry.emit()">
      {{ 'common.retry' | transloco }}
    </button>
  </div>`,
})
export class ErrorStateComponent {
  readonly messageKey = input('common.unexpected');
  readonly retry = output<void>();
}
