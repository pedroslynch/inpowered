import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { initials, roleLabel } from '../../core/format';
import { showsError } from '../../core/forms';
import { AGENCIES, CASE_STUDIES, DEFAULT_COUNTRY, OUTCOMES, REGIONS, STATS } from './landing.content';

/** Duration of the stats count-up. */
const STATS_COUNT_MS = 1000;

/**
 * Public landing page (source: src/main/design/paginainicial.pen, frame "inpowered.ai").
 * Logos and the hero diagram are exported from the design into public/landing; texts and
 * figures live in landing.content.ts.
 */
@Component({
  selector: 'app-landing',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly agencies = AGENCIES;
  protected readonly outcomes = OUTCOMES;
  protected readonly caseStudies = CASE_STUDIES;
  protected readonly stats = STATS;
  protected readonly countries = Object.keys(REGIONS);
  protected readonly year = new Date().getFullYear();

  // Signed-in user, shown in the menu (with Sign out) instead of the Log In link.
  protected readonly user = this.auth.user;
  protected readonly roleLabel = computed(() => roleLabel(this.user()?.role));
  protected readonly initials = computed(() => initials(this.user()?.fullName ?? ''));

  /** Phone menu (below 769px wide), opened by the burger button. */
  protected readonly menuOpen = signal(false);

  // Results band: the stats count up the first time they scroll into view.
  private readonly results = viewChild.required<ElementRef<HTMLElement>>('results');
  /** Count-up progress of the stats, from 0 to 1. */
  private readonly statsProgress = signal(0);
  protected readonly statValues = computed(() =>
    this.stats.map(
      (stat) =>
        stat.prefix + Math.round(stat.target * this.statsProgress()).toLocaleString('en-US') + stat.suffix,
    ),
  );

  // Demo request form. There is no backend for demo requests yet: a valid form only shows a confirmation.
  protected readonly demoForm = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    company: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    country: [DEFAULT_COUNTRY],
    state: [REGIONS[DEFAULT_COUNTRY][0]],
    message: [''],
  });
  /** States / regions of the selected country. */
  protected readonly regions = toSignal(
    this.demoForm.controls.country.valueChanges.pipe(map((country) => REGIONS[country])),
    { initialValue: REGIONS[DEFAULT_COUNTRY] },
  );
  protected readonly demoSent = signal(false);

  constructor() {
    // A new country selects its first state / region.
    this.demoForm.controls.country.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((country) => this.demoForm.controls.state.setValue(REGIONS[country][0]));
    afterNextRender(() => this.countUpStatsWhenVisible());
  }

  /** Any link in the phone menu closes it. */
  protected closeMenuOnLink(event: Event): void {
    if ((event.target as Element).closest('a')) {
      this.menuOpen.set(false);
    }
  }

  protected signOut(): void {
    this.auth.logout();
  }

  protected requestDemo(): void {
    if (this.demoForm.invalid) {
      this.demoForm.markAllAsTouched();
      return;
    }
    this.demoSent.set(true);
  }

  protected invalid(name: 'name' | 'company' | 'email'): boolean {
    return showsError(this.demoForm.controls[name]);
  }

  /**
   * Counts the stats up once, over one second (ease-out), the first time they scroll into view.
   * Without IntersectionObserver or with reduced motion, the final values show right away.
   */
  private countUpStatsWhenVisible(): void {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (typeof IntersectionObserver === 'undefined' || reduceMotion) {
      this.statsProgress.set(1);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / STATS_COUNT_MS, 1);
          this.statsProgress.set(1 - (1 - t) ** 3);
          if (t < 1) {
            frame = requestAnimationFrame(step);
          }
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    observer.observe(this.results().nativeElement);
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    });
  }
}
