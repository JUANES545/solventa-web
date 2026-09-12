import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'bell'
  | 'card'
  | 'check'
  | 'claim'
  | 'clock'
  | 'close'
  | 'device'
  | 'empty'
  | 'error'
  | 'file'
  | 'globe'
  | 'heart'
  | 'help'
  | 'home'
  | 'hourglass'
  | 'location'
  | 'lock'
  | 'menu'
  | 'moon'
  | 'network'
  | 'payment'
  | 'plane'
  | 'policy'
  | 'settings'
  | 'shield'
  | 'sparkles'
  | 'sun'
  | 'user';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'svg-icon-host', 'aria-hidden': 'true' },
  template: `
    <svg
      class="svg-icon"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @switch (name()) {
        @case ('home') {
          <path d="m3 10.8 9-7.2 9 7.2" />
          <path d="M5.4 9.7V21h13.2V9.7" />
          <path d="M9.4 21v-6.7h5.2V21" />
        }
        @case ('plane') {
          <path d="M22 2 9.8 14.2" />
          <path d="m22 2-7.6 20-4.6-7.8L2 9.6 22 2Z" />
        }
        @case ('policy') {
          <path d="M6.5 3h8l3 3v15h-11z" />
          <path d="M14.5 3v4h4" />
          <path d="M9.5 11h5M9.5 15h5" />
        }
        @case ('claim') {
          <path d="M12 3 4.5 6v5.4c0 4.6 3.1 7.9 7.5 9.6 4.4-1.7 7.5-5 7.5-9.6V6z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        }
        @case ('payment') {
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 9.5h18M7 15h3" />
        }
        @case ('bell') {
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"
          />
        }
        @case ('help') {
          <circle cx="12" cy="12" r="9" />
          <path d="M9.7 9a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.4 1-1.4 2" />
          <path d="M12 17h.01" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('close') {
          <path d="m6 6 12 12M18 6 6 18" />
        }
        @case ('moon') {
          <path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="3.7" />
          <path
            d="M12 2.5V5M12 19v2.5M21.5 12H19M5 12H2.5M18.7 5.3 17 7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3"
          />
        }
        @case ('check') {
          <path d="m5 12 4.2 4.2L19 6.5" />
        }
        @case ('heart') {
          <path
            d="M20.8 4.8a5.2 5.2 0 0 0-7.4 0L12 6.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z"
          />
        }
        @case ('device') {
          <rect x="6.5" y="2" width="11" height="20" rx="2.3" />
          <path d="M10 5h4M11.5 18.5h1" />
        }
        @case ('shield') {
          <path d="M12 3 4.5 6v5.4c0 4.6 3.1 7.9 7.5 9.6 4.4-1.7 7.5-5 7.5-9.6V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 6l-6 6 6 6" />
        }
        @case ('error') {
          <path
            d="M10.3 4.1 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0Z"
          />
          <path d="M12 9v4M12 17h.01" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        }
        @case ('hourglass') {
          <path
            d="M6 3h12M6 21h12M7 3c0 4 1.7 6.1 5 9-3.3 2.9-5 5-5 9M17 3c0 4-1.7 6.1-5 9 3.3 2.9 5 5 5 9"
          />
        }
        @case ('empty') {
          <path d="M4 5h16v14H4z" />
          <path d="m4 13 4-4 4 4 4-4 4 4" />
        }
        @case ('network') {
          <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />
        }
        @case ('sparkles') {
          <path
            d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2zM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7zM5 14l.7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7z"
          />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        }
        @case ('lock') {
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
        }
        @case ('location') {
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        }
        @case ('file') {
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v5h5" />
        }
        @case ('card') {
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 10h18M7 15h4" />
        }
      }
    </svg>
  `,
})
export class SvgIconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
