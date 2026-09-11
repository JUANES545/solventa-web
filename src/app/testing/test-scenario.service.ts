import { Injectable, signal } from '@angular/core';
import { TestScenario } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class TestScenarioService {
  readonly current = signal<TestScenario>('normal');

  select(scenario: TestScenario): void {
    this.current.set(scenario);
  }

  reset(): void {
    this.current.set('normal');
  }

  delay(): number {
    return this.current() === 'slow' ? 2800 : 450;
  }
}
