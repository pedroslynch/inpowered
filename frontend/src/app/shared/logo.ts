import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from './icon';

/** "Logo" component from the design system: spark mark + wordmark, for dark surfaces. */
@Component({
  selector: 'app-logo',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="mark"><app-icon name="sparkle" [size]="16" /></span>
    <span class="wordmark">inPowered AI</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
    .mark {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: var(--radius-pill);
      background: var(--action-primary);
      color: var(--text-on-action);
    }
    .wordmark {
      color: var(--text-on-inverse);
      font-size: var(--text-lg);
      white-space: nowrap;
    }
  `,
})
export class Logo {}
