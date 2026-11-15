export type Bhk = 2 | 3;

export interface Configuration {
  bhk: Bhk;
  /** Starting price in lakhs (₹). 100 lakhs = ₹1 crore. */
  priceLakhs: number;
}

export interface Location {
  slug: string;
  name: string;
  image: string;
  configurations: Configuration[];
}

export type PropertyCategory = '2-bhk' | '3-bhk' | 'apartments' | 'projects';

export interface PropertyCollection {
  id: PropertyCategory;
  label: string;
  title: string;
  location: string;
  image: string;
  imageAlt: string;
  bhk?: Bhk;
  specs: string[];
  description: string;
  whatsappText: string;
}

export interface Feature {
  title: string;
  description: string;
  image?: string;
}

export interface NavItem {
  label: string;
  to: string;
}
