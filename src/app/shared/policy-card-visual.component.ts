import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SvgIconComponent } from './svg-icon.component';
import { BrandMarkComponent } from './brand-mark.component';

@Component({
  selector: 'app-policy-card-visual',
  imports: [TranslocoPipe, SvgIconComponent, BrandMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="policy-card-stage"
      aria-hidden="true"
      (pointermove)="tilt($event)"
      (pointerleave)="reset()"
    >
      <article
        class="policy-card-3d"
        [style.--tilt-x]="tiltX() + 'deg'"
        [style.--tilt-y]="tiltY() + 'deg'"
      >
        <div class="policy-card-topline">
          <span class="policy-brand"><app-brand-mark [size]="25" /> Solventa</span>
          <app-icon name="shield" [size]="23" />
        </div>
        <span class="mini-label">SOL-TRV-2026-1842</span>
        <strong class="policy-product">{{ 'products.travel' | transloco }}</strong>
        <div class="policy-status">
          <app-icon name="check" [size]="15" />
          {{ 'policies.active' | transloco }}
        </div>
        <div class="policy-route">
          <span>Bogotá</span>
          <span class="route-line"><i></i><app-icon name="plane" [size]="17" /></span>
          <span>Madrid</span>
        </div>
        <div class="policy-card-footer">
          <span
            ><small>{{ 'policies.coverage' | transloco }}</small
            ><strong>Plus</strong></span
          >
          <span
            ><small>{{ 'policies.premium' | transloco }}</small
            ><strong>COP 139.900</strong></span
          >
        </div>
      </article>
      <div class="policy-card-orbit"></div>
    </div>
  `,
})
export class PolicyCardVisualComponent {
  readonly tiltX = signal(0);
  readonly tiltY = signal(0);

  tilt(event: PointerEvent): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    this.tiltX.set(y * -7);
    this.tiltY.set(x * 9);
  }

  reset(): void {
    this.tiltX.set(0);
    this.tiltY.set(0);
  }
}
