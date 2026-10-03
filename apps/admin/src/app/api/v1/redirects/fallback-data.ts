export const fallbackRedirects: any[] = [
  {
    id: 'redir_1',
    sourceUrl: '/old-blog',
    destinationUrl: '/articles',
    statusCode: 301,
    hitCount: 342,
    notes: 'Legacy directory permanent migration',
    createdAt: '2026-01-15T10:00:00.000Z',
    creator: { id: 'usr_admin', name: 'Super Administrator', email: 'admin@headless.io' },
  },
  {
    id: 'redir_2',
    sourceUrl: '/press-kit',
    destinationUrl: '/media',
    statusCode: 302,
    hitCount: 88,
    notes: 'Temporary redirect to DAM media kit',
    createdAt: '2026-02-01T12:00:00.000Z',
    creator: { id: 'usr_admin', name: 'Super Administrator', email: 'admin@headless.io' },
  },
];
