import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The inPowered AI logo (blue mark with a solid white spark, white wordmark), for dark surfaces. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img src="landing/logo.svg" alt="inPowered AI" width="150" height="31" />`,
  styles: `
    :host {
      display: inline-flex;
    }
    img {
      display: block;
      width: 150px;
      height: auto;
    }
  `,
})
export class Logo {}
