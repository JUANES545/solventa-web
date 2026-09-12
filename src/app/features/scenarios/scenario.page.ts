import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { TestScenario } from '../../models/domain.models';
import { IconName, SvgIconComponent } from '../../shared/svg-icon.component';
import { TestScenarioService } from '../../testing/test-scenario.service';

@Component({
  selector: 'app-scenario-page',
  imports: [TranslocoPipe, SvgIconComponent],
  template: `
    <section class="page-stack">
      <div class="page-heading">
        <span class="eyebrow">Development</span>
        <h1>{{ 'scenarios.title' | transloco }}</h1>
        <p>{{ 'scenarios.subtitle' | transloco }}</p>
      </div>
      <div class="inline-alert warning" role="status">
        <strong>{{ 'scenarios.active' | transloco }}:</strong>&nbsp;{{
          'scenarios.' + service.current() | transloco
        }}
      </div>
      <div class="scenario-grid">
        @for (scenario of scenarios; track scenario) {
          <button
            type="button"
            class="scenario-card"
            [class.active]="service.current() === scenario"
            (click)="service.select(scenario)"
          >
            <span><app-icon [name]="icons[scenario]" [size]="27" /></span
            ><strong>{{ 'scenarios.' + scenario | transloco }}</strong>
          </button>
        }
      </div>
    </section>
  `,
})
export class ScenarioPage {
  readonly service = inject(TestScenarioService);
  readonly scenarios: TestScenario[] = [
    'normal',
    'empty',
    'networkError',
    'slow',
    'sessionExpired',
    'paymentRejected',
    'quoteUnavailable',
    'claimSuccess',
    'claimError',
  ];
  readonly icons: Record<TestScenario, IconName> = {
    normal: 'check',
    empty: 'empty',
    networkError: 'network',
    slow: 'clock',
    sessionExpired: 'hourglass',
    paymentRejected: 'error',
    quoteUnavailable: 'empty',
    claimSuccess: 'claim',
    claimError: 'error',
  };
}
