import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LocalDatePipe } from './format.pipes';

describe('LocalDatePipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TranslocoService, useValue: { getActiveLang: () => 'es' } }],
    });
  });

  it('formats valid dates with Intl', () => {
    const pipe = TestBed.runInInjectionContext(() => new LocalDatePipe());
    expect(pipe.transform('2026-10-04')).toContain('2026');
  });

  it('keeps incomplete form dates from breaking the view', () => {
    const pipe = TestBed.runInInjectionContext(() => new LocalDatePipe());
    expect(pipe.transform('')).toBe('—');
    expect(pipe.transform('not-a-date')).toBe('—');
  });
});
