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
import { map } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { initials } from '../../core/format';

const STATS_COUNT_MS = 1000;

/** Countries of the demo form and their states / regions, in display order. */
const REGIONS: Record<string, string[]> = {
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
    'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming',
  ],
  Brazil: [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás',
    'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco',
    'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima',
    'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins',
  ],
  Canada: [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories',
    'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
  ],
  Mexico: [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila',
    'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico City', 'México', 'Michoacán',
    'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
  ],
  'United Kingdom': ['England', 'Northern Ireland', 'Scotland', 'Wales'],
  Germany: [
    'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony',
    'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony',
    'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia',
  ],
  France: [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire', 'Corsica', 'Grand Est',
    'Hauts-de-France', 'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire',
    "Provence-Alpes-Côte d'Azur",
  ],
  Australia: [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland', 'South Australia',
    'Tasmania', 'Victoria', 'Western Australia',
  ],
};

const DEFAULT_COUNTRY = 'United States';

interface Outcome {
  title: string;
  text: string;
  /** Partner logos shown in the card corner (an SVG in public/landing), if any. */
  partners?: { src: string; width: number; alt: string };
  /** Modifier class that picks the card background. */
  tone: string;
}

/**
 * Public landing page (source: src/main/design/paginainicial.pen, frame "inpowered.ai").
 * Logos and the hero diagram are exported from the design into public/landing.
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

  /** Signed-in user, shown in the menu (with Sign out) instead of the Log In link. */
  protected readonly user = this.auth.user;
  protected readonly roleLabel = computed(() => (this.auth.isAdmin() ? 'Administrator' : 'Seller'));
  protected readonly initials = computed(() => initials(this.user()?.fullName ?? ''));

  protected readonly year = new Date().getFullYear();

  protected readonly agencies = [
    { src: 'agency-pmg', alt: 'PMG', width: 150 },
    { src: 'agency-canvas-worldwide', alt: 'Canvas Worldwide', width: 138 },
    { src: 'agency-omd', alt: 'OMD', width: 141 },
    { src: 'agency-havas', alt: 'Havas', width: 113 },
    { src: 'agency-zenith', alt: 'Zenith', width: 77 },
    { src: 'agency-mindshare', alt: 'Mindshare', width: 204 },
    { src: 'agency-rise', alt: 'Rise', width: 81 },
    { src: 'agency-um', alt: 'UM', width: 50 },
    { src: 'agency-mekanism', alt: 'Mekanism', width: 194 },
    { src: 'agency-m-plus-p', alt: 'M+P', width: 149 },
    { src: 'agency-worldwide-agency', alt: 'Worldwide Agency', width: 87 },
  ];

  protected readonly outcomes: Outcome[] = [
    {
      title: 'Brand Lift',
      text: 'Drive stronger brand recall and favorability.',
      partners: { src: 'outcome-brand-lift', width: 202, alt: 'Kantar, Upwave, Cint' },
      tone: 'tone-1',
    },
    { title: 'Search Lift', text: 'Turn passive viewers into active searchers.', tone: 'tone-2' },
    {
      title: 'Store Visits',
      text: 'Drive verified foot traffic with precision.',
      partners: { src: 'outcome-store-visits', width: 62, alt: 'PlaceIQ' },
      tone: 'tone-3',
    },
    {
      title: 'App Subscriptions',
      text: 'Drive installs that lead to real value.',
      partners: { src: 'outcome-app-subscriptions', width: 169, alt: 'App measurement partners' },
      tone: 'tone-4',
    },
    {
      title: 'Customer Value',
      text: 'Grow customer value beyond the first conversion.',
      partners: { src: 'outcome-customer-value', width: 82, alt: 'LiveRamp' },
      tone: 'tone-5',
    },
    {
      title: 'Attention',
      text: 'Capture more qualified leads, faster.',
      partners: { src: 'outcome-attention', width: 21, alt: 'Adelaide' },
      tone: 'tone-6',
    },
    {
      title: 'Engagement',
      text: 'Drive Engagement with Sell-Side AI Decisioning.',
      partners: { src: 'outcome-engagement', width: 128, alt: 'Engagement partners' },
      tone: 'tone-7',
    },
    {
      title: 'Efficient Reach',
      text: 'Deliver Efficient Reach with Sell-Side AI Decisioning.',
      partners: { src: 'outcome-efficient-reach', width: 128, alt: 'Reach partners' },
      tone: 'tone-8',
    },
  ];

  /** Each title is split around its highlighted result. */
  protected readonly caseStudies = [
    {
      title: ['National Business Services Retailer ', 'Reduced Cost Per Store Visit by 80%', ''],
      image: 'case-study-1.png',
      partners: { src: 'case-partners-1', width: 272, alt: 'inPowered AI + OpenX + Precisely' },
    },
    {
      title: ['How Sell‑Side Decisioning Drove a ', '75% Drop in Cost per Visit', ' for a Major Retailer'],
      image: 'case-study-2.png',
      partners: { src: 'case-partners-2', width: 164, alt: 'inPowered AI + Index Exchange' },
    },
    {
      title: ['Soft Drink Brand ', 'Increases Targeted Reach by 53%', ' with Sell‑Side AI Decisioning'],
      image: 'case-study-3.png',
    },
  ];

  protected readonly stats = [
    { target: 100, prefix: '$', suffix: 'm+', label: 'Ad Spend' },
    { target: 70, prefix: '', suffix: '%', label: 'Average KPI Uplift' },
    { target: 5000, prefix: '', suffix: '+', label: 'Campaigns' },
  ];

  /** Count-up progress of the stats, from 0 to 1. */
  private readonly statsProgress = signal(0);

  protected readonly statValues = computed(() =>
    this.stats.map(
      (stat) =>
        stat.prefix + Math.round(stat.target * this.statsProgress()).toLocaleString('en-US') + stat.suffix,
    ),
  );

  private readonly results = viewChild.required<ElementRef<HTMLElement>>('results');

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.demoForm.controls.country.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((country) => this.demoForm.controls.state.setValue(REGIONS[country][0]));
    afterNextRender(() => {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (typeof IntersectionObserver === 'undefined' || reduceMotion) {
        this.statsProgress.set(1);
        return;
      }
      // Counts up once, over one second, the first time the stats scroll into view.
      let frame = 0;
      const observer = new IntersectionObserver(([entry]) => {
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
      }, { threshold: 0.5 });
      observer.observe(this.results().nativeElement);
      destroyRef.onDestroy(() => {
        observer.disconnect();
        cancelAnimationFrame(frame);
      });
    });
  }

  protected readonly countries = Object.keys(REGIONS);

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

  /** Phone menu (below 769px wide), opened by the burger button. */
  protected readonly menuOpen = signal(false);

  /** Any link in the phone menu closes it. */
  protected closeMenuOnLink(event: Event): void {
    if ((event.target as Element).closest('a')) {
      this.menuOpen.set(false);
    }
  }

  protected signOut(): void {
    this.auth.logout();
  }

  /** There is no backend for demo requests yet: a valid form only shows a confirmation. */
  protected readonly demoSent = signal(false);

  protected requestDemo(): void {
    if (this.demoForm.invalid) {
      this.demoForm.markAllAsTouched();
      return;
    }
    this.demoSent.set(true);
  }

  protected invalid(name: 'name' | 'company' | 'email'): boolean {
    const control = this.demoForm.controls[name];
    return control.invalid && control.touched;
  }
}
