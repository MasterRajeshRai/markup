export interface FallbackWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  retryCount: number;
  deliveriesCount: number;
  createdAt: string;
}

export const fallbackWebhooks: FallbackWebhook[] = [
  {
    id: 'wh_deploy_preview',
    name: 'Frontend On-Demand Revalidation',
    url: 'http://localhost:3001/api/revalidate',
    events: ['content.published', 'content.updated', 'content.deleted'],
    isActive: true,
    retryCount: 3,
    deliveriesCount: 42,
    createdAt: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'wh_algolia_sync',
    name: 'Search Index Sync',
    url: 'https://api.search-provider.com/v1/indexes/content/batch',
    events: ['content.published'],
    isActive: true,
    retryCount: 3,
    deliveriesCount: 19,
    createdAt: new Date('2025-01-05').toISOString(),
  },
];
