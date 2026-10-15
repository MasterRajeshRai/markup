import { CmsCategory } from '@/types';

export const EDITORIAL_CATEGORIES: CmsCategory[] = [
  {
    id: 'term_cat_19',
    name: 'Culture',
    slug: 'culture',
    description: 'Deep dives into traditions, arts, history, literature, cinema, and the ideas shaping modern civilization.',
    count: 117,
  },
  {
    id: 'term_cat_13',
    name: 'Leisure',
    slug: 'leisure',
    description: 'Mindful living, food rituals, coffee culture, design, wellness, and thoughtful leisure pursuits.',
    count: 80,
  },
  {
    id: 'term_cat_15',
    name: 'Newscast',
    slug: 'newscast',
    description: 'Verified investigative reports, policy analyses, public interest journalism, and national affairs.',
    count: 164,
  },
  {
    id: 'term_cat_16',
    name: 'Odyssey',
    slug: 'odyssey',
    description: 'Expeditions into technology, artificial intelligence, science, clean energy, and future human horizons.',
    count: 59,
  },
  {
    id: 'term_cat_17',
    name: 'Rendezvous',
    slug: 'rendezvous',
    description: 'In-depth profiles, exclusive dialogues, cultural icons, philanthropists, and voices of influence.',
    count: 37,
  },
];

export function getCategoryBySlug(slug: string): CmsCategory | undefined {
  return EDITORIAL_CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}
