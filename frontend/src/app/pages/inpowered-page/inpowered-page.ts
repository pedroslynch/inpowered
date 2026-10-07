import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

/**
 * Shows a copy of an inpowered.ai page full screen (bundled from frontend/inpowered-pages, see its README).
 * The copy's menu links post `{ type: 'navigate', url }` messages, which open the matching page or landing
 * section of this app.
 */
@Component({
  selector: 'app-inpowered-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!framed) {
      <iframe [src]="url()" [title]="frameTitle()"></iframe>
    }
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
    }
    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }
  `,
})
export class InpoweredPage implements OnInit {
  /** The copy to show, from the route data, e.g. `/inpowered-about.html`. */
  readonly page = input.required<string>();

  /** Accessible name of the frame, from the route data. */
  readonly frameTitle = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly url = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.page()));

  /** A copy lives at its route's URL inside its frame, so reloading the frame loads this route again. */
  protected readonly framed = window.self !== window.top;

  private readonly router = inject(Router);

  constructor() {
    if (this.framed) {
      return;
    }
    const onMessage = (event: MessageEvent) => {
      const url = event.data?.url;
      if (event.origin !== window.location.origin || event.data?.type !== 'navigate' || !isAppPath(url)) {
        return;
      }
      const [path, fragment] = url.split('#');
      void this.router.navigateByUrl(path).then(() => {
        if (fragment) {
          // Wait for the landing page to render before scrolling to its section.
          setTimeout(() => document.getElementById(fragment)?.scrollIntoView());
        }
      });
    };
    window.addEventListener('message', onMessage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('message', onMessage));
  }

  ngOnInit(): void {
    if (this.framed) {
      window.location.replace(this.page());
    }
  }
}

/** Only paths inside this app are accepted, never other sites. */
function isAppPath(url: unknown): url is string {
  return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');
}
