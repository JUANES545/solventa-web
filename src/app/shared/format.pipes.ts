import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({ name: 'cop', standalone: true, pure: false })
export class CopPipe implements PipeTransform {
  private readonly transloco = inject(TranslocoService);
  transform(value: number): string {
    const locale = this.transloco.getActiveLang() === 'en' ? 'en-US' : 'es-CO';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}

@Pipe({ name: 'localDate', standalone: true, pure: false })
export class LocalDatePipe implements PipeTransform {
  private readonly transloco = inject(TranslocoService);
  transform(value: string): string {
    const locale = this.transloco.getActiveLang() === 'en' ? 'en-US' : 'es-CO';
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(`${value}T00:00:00Z`),
    );
  }
}
