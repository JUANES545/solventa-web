import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { App } from './app';
import { ThemeService } from './core/theme.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: { preference: () => 'system' } },
        { provide: TranslocoService, useValue: { getActiveLang: () => 'es' } },
      ],
    }).compileComponents();
  });

  it('creates the application shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hosts routed content', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
  });
});
