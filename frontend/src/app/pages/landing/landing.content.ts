/**
 * Content of the landing page (texts, logos and figures of the inpowered.ai home page, see
 * src/main/design/paginainicial.pen). Image names refer to SVG/PNG files in public/landing.
 */

/** A logo image: `src` is the file name in public/landing, without the .svg extension. */
export interface LogoImage {
  src: string;
  width: number;
  alt: string;
}

export interface Outcome {
  title: string;
  text: string;
  /** Partner logos shown in the card corner (an SVG in public/landing), if any. */
  partners?: LogoImage;
  /** Modifier class that picks the card background. */
  tone: string;
}

export interface CaseStudy {
  /** The title split around its highlighted result: [before, highlight, after]. */
  title: [string, string, string];
  /** File name of the card image in public/landing. */
  image: string;
  partners?: LogoImage;
}

export interface Stat {
  target: number;
  prefix: string;
  suffix: string;
  label: string;
}

/** Agencies in the logo marquee. */
export const AGENCIES: LogoImage[] = [
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

export const OUTCOMES: Outcome[] = [
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

export const CASE_STUDIES: CaseStudy[] = [
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

/** Figures of the results band; they count up from 0 to `target`. */
export const STATS: Stat[] = [
  { target: 100, prefix: '$', suffix: 'm+', label: 'Ad Spend' },
  { target: 70, prefix: '', suffix: '%', label: 'Average KPI Uplift' },
  { target: 5000, prefix: '', suffix: '+', label: 'Campaigns' },
];

/** Countries of the demo form and their states / regions, in display order. */
export const REGIONS: Record<string, string[]> = {
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

export const DEFAULT_COUNTRY = 'United States';
