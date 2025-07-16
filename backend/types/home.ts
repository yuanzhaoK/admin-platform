import { Advertisement } from './advertisement.ts';

export type HomeBanner = Omit<Advertisement, 'weight' | 'click_count' | 'view_count' | 'budget' | 'cost' | 'tags' >;