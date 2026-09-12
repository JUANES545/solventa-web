import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SolventaTranslocoLoader } from './transloco-loader';

describe('SolventaTranslocoLoader', () => {
  let httpTesting: HttpTestingController;
  let loader: SolventaTranslocoLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolventaTranslocoLoader, provideHttpClient(), provideHttpClientTesting()],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    loader = TestBed.inject(SolventaTranslocoLoader);
  });

  afterEach(() => httpTesting.verify());

  it('loads translations relative to the application base path', () => {
    loader.getTranslation('es').subscribe((translation) => {
      expect(translation).toEqual({ brand: { name: 'Solventa' } });
    });

    const request = httpTesting.expectOne('i18n/es.json');
    expect(request.request.method).toBe('GET');
    request.flush({ brand: { name: 'Solventa' } });
  });
});
