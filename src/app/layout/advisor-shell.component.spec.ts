import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { AdvisorFacade } from '../core/advisor.facade';
import { AppStore } from '../core/app-store.service';
import { AdvisorShellComponent } from './advisor-shell.component';

describe('AdvisorShellComponent', () => {
  it('changes the active language and stores the preference', () => {
    localStorage.clear();
    let language = 'es';
    const transloco = {
      getActiveLang: () => language,
      setActiveLang: vi.fn((value: string) => (language = value)),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: TranslocoService, useValue: transloco },
        { provide: AppStore, useValue: { advisor: () => null, logout: vi.fn() } },
        {
          provide: AdvisorFacade,
          useValue: { selectedCustomer: () => null, closeCustomerContext: vi.fn() },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    const shell = TestBed.runInInjectionContext(() => new AdvisorShellComponent());
    shell.toggleLanguage();

    expect(transloco.setActiveLang).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('solventa.language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
