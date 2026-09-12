import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';
import { TranslocoService } from '@jsverse/transloco';
import { AmbientBackgroundComponent } from './shared/three/ambient-background.component';
import { ThemeToggleComponent } from './shared/theme-toggle.component';

@Component({
  imports: [RouterOutlet, AmbientBackgroundComponent, ThemeToggleComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly theme = inject(ThemeService);
  private readonly transloco = inject(TranslocoService);
  constructor() {
    void this.theme.preference();
    document.documentElement.lang = this.transloco.getActiveLang();
  }
}
